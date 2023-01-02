"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const url = require("url");
const url_1 = require("url");
const child_process_1 = require("child_process");
const jsdom_1 = require("jsdom");
const utils_1 = require("@hint/utils");
const utils_network_1 = require("@hint/utils-network");
const utils_dom_1 = require("@hint/utils-dom");
const utils_debug_1 = require("@hint/utils-debug");
const utils_connector_tools_1 = require("@hint/utils-connector-tools");
const resource_loader_1 = require("./resource-loader");
const before_parse_1 = require("./before-parse");
const debug = (0, utils_debug_1.debug)(__filename);
const defaultOptions = {
    ignoreHTTPSErrors: false,
    strictSSL: false,
    waitFor: 5000
};
class JSDOMConnector {
    constructor(server, config) {
        this._href = '';
        this._options = Object.assign(Object.assign({}, defaultOptions), config);
        const requesterOptions = Object.assign({ rejectUnauthorized: !this._options.ignoreHTTPSErrors }, this._options.requestOptions || {});
        if (this._options.strictSSL && this._options.ignoreHTTPSErrors) {
            this._options.strictSSL = false;
        }
        this.request = new utils_connector_tools_1.Requester(requesterOptions);
        this.server = server;
        this._timeout = server.timeout;
        this._subprocesses = new Set();
        server.on('parse::end::html', (event) => {
            if (!this._originalDocument) {
                this._originalDocument = event.document;
            }
        });
    }
    _fetchUrl(target, customHeaders) {
        const uri = url.format(target);
        if (!customHeaders) {
            return this.request.get(uri);
        }
        const r = new utils_connector_tools_1.Requester({
            headers: customHeaders,
            rejectUnauthorized: !this._options.ignoreHTTPSErrors
        });
        return r.get(uri);
    }
    async getFavicon(element) {
        const href = (element && element.getAttribute('href')) || '/favicon.ico';
        try {
            await this._resourceLoader.fetch(this._document.resolveUrl(href), { element });
        }
        catch (e) {
            debug('Error loading ${href}', e);
        }
    }
    collect(target) {
        if (!target.protocol.match(/https?:/)) {
            const err = {
                message: `Protocol "${target.protocol}" is invalid for the current collector`,
                type: 'InvalidTarget'
            };
            throw err;
        }
        const href = this._href = target.href;
        const initialEvent = { resource: href };
        this.fetchedHrefs = new Set();
        this.server.emit('scan::start', initialEvent);
        return new Promise(async (resolve, reject) => {
            debug(`About to start fetching ${href}`);
            await this.server.emitAsync('fetch::start::target', initialEvent);
            try {
                this._targetNetworkData = await this.fetchContent(target);
            }
            catch (err) {
                const e = err;
                const hops = this.request.getRedirects(e.uri);
                const fetchError = {
                    element: null,
                    error: e.error ? e.error : e,
                    hops,
                    resource: href
                };
                await this.server.emitAsync('fetch::error', fetchError);
                debug(`Failed to fetch: ${href}\n${err}`);
                await this.server.emitAsync('scan::end', initialEvent);
                reject(fetchError);
                return;
            }
            this.finalHref = this._targetNetworkData.response.url;
            debug(`HTML for ${this.finalHref} downloaded`);
            const fetchEnd = {
                element: null,
                request: this._targetNetworkData.request,
                resource: this.finalHref,
                response: this._targetNetworkData.response
            };
            const { charset, mediaType } = await (0, utils_1.getContentTypeData)(fetchEnd.element, fetchEnd.resource, fetchEnd.response.headers, fetchEnd.response.body.rawContent);
            fetchEnd.response.mediaType = mediaType;
            fetchEnd.response.charset = charset;
            await this.server.emitAsync(`fetch::end::${(0, utils_1.getType)(mediaType)}`, fetchEnd);
            if (!(0, utils_network_1.isHTMLDocument)(this.finalHref, this.headers)) {
                await this.server.emitAsync('scan::end', { resource: this.finalHref });
                resolve();
                return;
            }
            const virtualConsole = new jsdom_1.VirtualConsole();
            virtualConsole.on('error', (err) => {
                debug(`Console: ${err}`);
            });
            virtualConsole.on('jsdomError', (err) => {
                debug(`Console: ${err}`);
            });
            const initialDocument = (0, utils_dom_1.createHTMLDocument)(fetchEnd.response.body.content, this.finalHref);
            this._resourceLoader = new resource_loader_1.default(this, initialDocument);
            const jsdom = new jsdom_1.JSDOM(this._targetNetworkData.response.body.content, {
                beforeParse: (0, before_parse_1.beforeParse)(this.finalHref),
                pretendToBeVisual: true,
                resources: this._resourceLoader,
                runScripts: 'dangerously',
                url: this.finalHref,
                virtualConsole
            });
            const window = jsdom.window;
            this._window = window;
            const onLoad = () => {
                setTimeout(async () => {
                    const event = { resource: this.finalHref };
                    debug(`${this.finalHref} loaded, traversing`);
                    try {
                        const html = this._window.document.documentElement.outerHTML;
                        const htmlDocument = (0, utils_dom_1.createHTMLDocument)(html, this.finalHref, this._originalDocument);
                        this._document = htmlDocument;
                        const evaluateEvent = {
                            document: htmlDocument,
                            resource: this.finalHref
                        };
                        await this.server.emitAsync('can-evaluate::script', evaluateEvent);
                        await (0, utils_dom_1.traverse)(htmlDocument, this.server, this.finalHref);
                        await this.getFavicon(window.document.querySelector('link[rel~="icon"]'));
                        await this.server.emitAsync('scan::end', event);
                    }
                    catch (e) {
                        reject(e);
                    }
                    resolve();
                }, this._options.waitFor);
            };
            const onError = (error) => {
                debug(`onError: ${error}`);
            };
            jsdom.window.addEventListener('load', onLoad, { once: true });
            jsdom.window.addEventListener('error', onError);
        });
    }
    close() {
        try {
            this._window.close();
        }
        catch (e) {
            debug(`Exception ignored while closing JSDOM connector (most likely pending network requests)`);
            debug(e);
        }
        finally {
            this.killAllSubprocesses();
        }
        return Promise.resolve();
    }
    fetchContent(target, customHeaders) {
        let parsedTarget = target;
        if (typeof parsedTarget === 'string') {
            parsedTarget = parsedTarget.indexOf('//') === 0 ? `http:${parsedTarget}` : parsedTarget;
            parsedTarget = new url_1.URL(parsedTarget);
            return this.fetchContent(parsedTarget, customHeaders);
        }
        return this._fetchUrl(parsedTarget, customHeaders);
    }
    killProcess(runner) {
        try {
            runner.kill('SIGKILL');
        }
        catch (err) {
            debug('Error closing evaluate process');
        }
        finally {
            this._subprocesses.delete(runner);
        }
    }
    killAllSubprocesses() {
        this._subprocesses.forEach((subprocess) => {
            this.killProcess(subprocess);
        });
    }
    evaluate(source) {
        return new Promise((resolve, reject) => {
            const runner = (0, child_process_1.fork)(path.join(__dirname, 'evaluate-runner'), [this.finalHref || this._href, this._options.waitFor], { execArgv: [] });
            let timeoutId = null;
            this._subprocesses.add(runner);
            runner.on('message', (result) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
                this.killProcess(runner);
                if (result.error) {
                    return reject(result.error);
                }
                return resolve(result.evaluate);
            });
            runner.send({
                options: this._options,
                source
            });
            timeoutId = setTimeout(() => {
                debug(`Evaluation timed out after ${this._timeout / 1000}s. Killing process and reporting an error.`);
                this.killProcess(runner);
                return reject(new Error(`Script evaluation exceeded the allotted time of ${this._timeout / 1000}s.`));
            }, this._timeout);
        });
    }
    querySelectorAll(selector) {
        return this._document.querySelectorAll(selector);
    }
    get dom() {
        return this._document;
    }
    get headers() {
        return this._targetNetworkData.response.headers;
    }
    get html() {
        return this._document.pageHTML();
    }
}
exports.default = JSDOMConnector;
JSDOMConnector.schema = {
    additionalProperties: false,
    properties: {
        ignoreHTTPSErrors: { type: 'boolean' },
        requestOptions: { type: 'object' },
        waitFor: {
            minimum: 0,
            type: 'number'
        }
    }
};
