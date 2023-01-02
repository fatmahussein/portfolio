"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isCI = require("is-ci");
const compact = require("lodash/compact");
const utils_1 = require("@hint/utils");
const utils_network_1 = require("@hint/utils-network");
const utils_dom_1 = require("@hint/utils-dom");
const utils_debug_1 = require("@hint/utils-debug");
const utils_connector_tools_1 = require("@hint/utils-connector-tools");
const chromium_finder_1 = require("./lib/chromium-finder");
const actions_1 = require("./lib/actions");
const authenticators_1 = require("./lib/authenticators");
const lifecycle_1 = require("./lib/lifecycle");
const get_favicon_1 = require("./lib/get-favicon");
const events_1 = require("./lib/events");
const schema_1 = require("./lib/schema");
const debug = (0, utils_debug_1.debug)(__filename);
class PuppeteerConnector {
    constructor(engine, options = {}) {
        this._finalHref = '';
        this._headers = {};
        this._ignoredMethods = ['OPTIONS'];
        this._listeners = new Map();
        this._pendingRequests = [];
        this._engine = engine;
        engine.on('parse::end::html', (event) => {
            if (!this._originalDocument) {
                this._originalDocument = event.document;
            }
        });
        this._connectorOptions = options;
        this._waitUntil = options && options.waitUntil ? options.waitUntil : 'networkidle2';
        if (this._connectorOptions.browser) {
            const browser = this._connectorOptions.browser;
            this._connectorOptions.browser = browser.charAt(0).toUpperCase() + browser.slice(1);
        }
        this._options = this.toPuppeteerOptions(this._connectorOptions);
        this._actions = (0, actions_1.group)(options.actions);
        if (options.auth) {
            this._actions.beforeTargetNavigation.unshift(authenticators_1.basicHTTPAuth);
            this._actions.afterTargetNavigation.unshift(authenticators_1.formAuth);
        }
    }
    isIgnoredMethod(method) {
        return this._ignoredMethods.includes(method);
    }
    toPuppeteerOptions(options = {}) {
        const headless = 'headless' in options ?
            options.headless :
            isCI || (0, utils_1.getPlatform)() === 'wsl';
        let executablePath;
        if (!options.puppeteerOptions || !('executablePath' in options.puppeteerOptions)) {
            executablePath = 'browser' in options ?
                (0, chromium_finder_1.getInstallationPath)({ browser: options.browser }) :
                (0, chromium_finder_1.getInstallationPath)();
        }
        const handleSIGs = 'detached' in options ? {
            handleSIGHUP: !options.detached,
            handleSIGINT: !options.detached,
            handleSIGTERM: !options.detached
        } : {};
        const ignoreHTTPSErrors = 'ignoreHTTPSErrors' in options && options.ignoreHTTPSErrors ? {
            args: ['--enable-features=NetworkService'],
            ignoreHTTPSErrors: true
        } : {};
        const topLevelOptions = Object.assign(Object.assign({ detached: !!options.detached, executablePath,
            headless }, handleSIGs), ignoreHTTPSErrors);
        const finalOptions = Object.assign(Object.assign({}, topLevelOptions), options.puppeteerOptions);
        debug(`Puppeteer configuration: %O`, finalOptions);
        return finalOptions;
    }
    onError(error) {
        debug(`Error: ${error}`);
    }
    waitForTarget() {
        if (this._targetBody !== undefined) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            this._targetReady = resolve;
            this._targetFailed = reject;
        });
    }
    async onRequest(request) {
        if (this.isIgnoredMethod(request.method())) {
            return;
        }
        if (request.isNavigationRequest()) {
            this._headers = (0, utils_connector_tools_1.normalizeHeaders)(request.headers());
        }
        const { name, payload } = (0, events_1.onRequestHandler)(request);
        await this._engine.emitAsync(name, payload);
    }
    async onRequestFailed(request) {
        const response = request.response();
        if (response && response.status() >= 400) {
            return;
        }
        const event = (0, events_1.onRequestFailedHandler)(request, this._dom);
        if (request.isNavigationRequest() && this._targetFailed) {
            this._targetFailed();
        }
        if (!event) {
            this._pendingRequests.push(this.onRequestFailed.bind(this, request));
            return;
        }
        await this._engine.emitAsync(event.name, event.payload);
    }
    async onResponse(response) {
        if (this.isIgnoredMethod(response.request().method())) {
            return;
        }
        const resource = response.url();
        const isTarget = response.request().isNavigationRequest();
        const status = response.status();
        debug(`Response received: ${resource}`);
        if (status >= 300 && status < 400) {
            return;
        }
        const event = (await (0, events_1.onResponseHandler)(response, this.fetchContent.bind(this), this._dom));
        if (!event) {
            this._pendingRequests.push(this.onResponse.bind(this, response));
            return;
        }
        const { name, payload } = event;
        if (isTarget) {
            this._targetBody = payload.response.body.content;
            this._targetNetworkData = payload;
            if (name === 'fetch::end::html') {
                this._originalDocument = (0, utils_dom_1.createHTMLDocument)(this._targetBody, resource);
            }
        }
        await this._engine.emitAsync(name, payload);
        if (isTarget && this._targetReady) {
            this._targetReady();
        }
    }
    addListeners() {
        debug(`Adding event listeners`);
        const onError = this.onError.bind(this);
        const onRequest = this.onRequest.bind(this);
        const onRequestFailed = this.onRequestFailed.bind(this);
        const onResponse = this.onResponse.bind(this);
        this._listeners.set("error", onError);
        this._listeners.set("pageerror", onError);
        this._listeners.set("request", onRequest);
        this._listeners.set("requestfailed", onRequestFailed);
        this._listeners.set("response", onResponse);
        for (const [eventName, handler] of this._listeners) {
            this._page.on(eventName, handler);
        }
    }
    removeListeners(name) {
        if (!name) {
            debug(`Removing all pending event listeners (${this._listeners.size})`);
            this.removeListeners(Array.from(this._listeners.keys()));
            return;
        }
        if (Array.isArray(name)) {
            debug(`Removing event listeners for ${name}`);
            for (const eventName of name) {
                this.removeListeners(eventName);
            }
            return;
        }
        const handler = this._listeners.get(name);
        debug(`Removing handler for event "${name}"`);
        if (handler) {
            this._page.removeListener(name, handler);
            this._listeners.delete(name);
        }
    }
    async initiate(target) {
        if (!(0, utils_network_1.isRegularProtocol)(target.href)) {
            const error = new Error(`Target protocol is not valid (is ${target.protocol})`);
            error.type = 'InvalidTarget';
            throw error;
        }
        const { browser, page } = await (0, lifecycle_1.launch)(this._options);
        this._browser = browser;
        this._page = page;
    }
    async processTarget() {
        await this.waitForTarget();
        const html = await this._page.content();
        this._dom = (0, utils_dom_1.createHTMLDocument)(html, this._finalHref, this._originalDocument);
        while (this._pendingRequests.length > 0) {
            const pendingRequest = this._pendingRequests.shift();
            await pendingRequest();
        }
        if (this._options.headless) {
            await (0, get_favicon_1.getFavicon)(this._dom, this.fetchContent.bind(this), this._engine);
        }
        if (this._targetBody) {
            await (0, utils_dom_1.traverse)(this._dom, this._engine, this._page.url());
            const event = {
                document: this._dom,
                resource: this._finalHref
            };
            await this._engine.emitAsync('can-evaluate::script', event);
        }
    }
    async close() {
        this.removeListeners();
        await (0, lifecycle_1.close)(this._browser, this._page, this._options);
    }
    evaluate(code) {
        return this._page.evaluate(code);
    }
    async collect(target) {
        await this.initiate(target);
        await this._engine.emit('scan::start', { resource: target.href });
        debug(`Executing "beforeTargetNavigation" actions`);
        for (const action of this._actions.beforeTargetNavigation) {
            await action(this._page, this._connectorOptions);
        }
        this.addListeners();
        debug(`Navigating to ${target.href}`);
        await this._page.goto(target.href, { waitUntil: this._waitUntil });
        debug(`Executing "afterTargetNavigation" actions`);
        for (const action of this._actions.afterTargetNavigation) {
            await action(this._page, this._connectorOptions);
        }
        this._finalHref = this._page.url();
        debug(`Navigation complete`);
        this.removeListeners(["request", "requestfailed", "response"]);
        await this.processTarget();
        await this._engine.emitAsync('scan::end', { resource: this._finalHref });
    }
    fetchContent(target, customHeaders) {
        const assigns = compact([this && this._headers, customHeaders]);
        const headers = Object.assign({}, ...assigns);
        const href = typeof target === 'string' ? target : target.href;
        const options = {
            headers,
            rejectUnauthorized: !this._options.ignoreHTTPSErrors
        };
        const request = new utils_connector_tools_1.Requester(options);
        return request.get(href);
    }
    querySelectorAll(selector) {
        if (!this._dom) {
            return [];
        }
        return this._dom.querySelectorAll(selector);
    }
    get dom() {
        return this._dom;
    }
    get html() {
        if (!this._dom) {
            return '';
        }
        return this._dom.pageHTML();
    }
    get headers() {
        return this._targetNetworkData &&
            this._targetNetworkData.response &&
            (0, utils_connector_tools_1.normalizeHeaders)(this._targetNetworkData.response.headers) ||
            undefined;
    }
}
exports.default = PuppeteerConnector;
PuppeteerConnector.schema = schema_1.schema;
