"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
try {
    const canvasPath = require.resolve('canvas');
    const Module = require('module');
    const fakeCanvas = new Module('', null);
    fakeCanvas.exports = function () { };
    require.cache[canvasPath] = fakeCanvas;
}
catch (e) {
}
const url = require("url");
const path = require("path");
const fs_1 = require("fs");
const util_1 = require("util");
const readFileAsBuffer = (0, util_1.promisify)(fs_1.readFile);
const chokidar = require("chokidar");
const globby = require("globby");
const jsdom_1 = require("jsdom");
const utils_1 = require("@hint/utils");
const utils_fs_1 = require("@hint/utils-fs");
const utils_network_1 = require("@hint/utils-network");
const utils_dom_1 = require("@hint/utils-dom");
const i18n_import_1 = require("./i18n.import");
const defaultOptions = {};
class LocalConnector {
    constructor(engine, config) {
        this._href = '';
        this.watcher = null;
        this._options = Object.assign(Object.assign({}, defaultOptions), config);
        this.filesPattern = this.getFilesPattern();
        this.engine = engine;
        this.engine.on('parse::end::html', this.onParseHTML.bind(this));
    }
    getFilesPattern() {
        const pattern = this._options.pattern;
        if (!pattern) {
            return ['**', '!.git/**'];
        }
        if (Array.isArray(pattern)) {
            return pattern.length > 0 ? pattern : [];
        }
        return [pattern];
    }
    async notifyFetch(event) {
        const type = (0, utils_1.getType)(event.response.mediaType);
        await this.engine.emitAsync(`fetch::end::${type}`, event);
    }
    async fetch(target, options) {
        const event = await this.fetchData(target, options);
        return this.notifyFetch(event);
    }
    async fetchData(target, options) {
        const content = await this.fetchContent(target, undefined, options);
        const uri = (0, utils_network_1.getAsUri)(target);
        return {
            element: null,
            request: content.request,
            resource: uri ? url.format(uri) : '',
            response: content.response
        };
    }
    async getGitIgnore() {
        try {
            const rawList = await (0, utils_fs_1.readFileAsync)(path.join((0, utils_fs_1.cwd)(), '.gitignore'));
            const splitList = rawList.split('\n');
            const result = splitList.reduce((total, ignore) => {
                const value = ignore.trim();
                if (!value) {
                    return total;
                }
                if (value[0] === '/') {
                    total.push(value.substr(1));
                }
                else {
                    total.push(value);
                }
                return total;
            }, []);
            return result;
        }
        catch (err) {
            utils_1.logger.error((0, i18n_import_1.getMessage)('errorReading', this.engine.language));
            return [];
        }
    }
    async notify() {
        const href = this._href;
        const scanEndEvent = { resource: href };
        await this.engine.emitAsync('scan::end', scanEndEvent);
        await this.engine.notify(href);
        utils_1.logger.log((0, i18n_import_1.getMessage)('watchingForChanges', this.engine.language));
    }
    watch(targetString) {
        return new Promise(async (resolve, reject) => {
            const isF = (0, utils_fs_1.isFile)(targetString);
            const target = isF ? targetString : '.';
            const ignored = await this.getGitIgnore();
            this.watcher = chokidar.watch(target, {
                cwd: !isF ? targetString : undefined,
                ignored: ignored.concat(['.git/']),
                ignoreInitial: true,
                ignorePermissionErrors: true
            });
            const getFile = (filePath) => {
                if (isF) {
                    return filePath;
                }
                if (path.isAbsolute(filePath)) {
                    return filePath;
                }
                return path.join(targetString, filePath);
            };
            const onAdd = async (filePath) => {
                const file = getFile(filePath);
                utils_1.logger.log((0, i18n_import_1.getMessage)('fileAdded', this.engine.language, file));
                await this.fetch(file);
                await this.notify();
            };
            const onChange = async (filePath) => {
                const file = getFile(filePath);
                const fileUrl = (0, utils_network_1.getAsUri)(file);
                utils_1.logger.log((0, i18n_import_1.getMessage)('fileChanged', this.engine.language, file));
                if (fileUrl) {
                    this.engine.clean(fileUrl);
                }
                await this.fetch(file);
                await this.notify();
            };
            const onUnlink = async (filePath) => {
                const file = getFile(filePath);
                const fileUrl = (0, utils_network_1.getAsUri)(file);
                if (fileUrl) {
                    this.engine.clean(fileUrl);
                }
                utils_1.logger.log((0, i18n_import_1.getMessage)('fileDeleted', this.engine.language, file));
                await this.notify();
            };
            const onReady = async () => {
                await this.notify();
            };
            const onError = (err) => {
                utils_1.logger.error((0, i18n_import_1.getMessage)('error', this.engine.language), err);
                reject(err);
            };
            const onClose = () => {
                if (this.watcher) {
                    this.watcher.close();
                }
                this.engine.clear();
                resolve();
            };
            this.watcher
                .on('add', onAdd.bind(this))
                .on('change', onChange.bind(this))
                .on('unlink', onUnlink.bind(this))
                .on('error', onError)
                .on('ready', onReady)
                .on('close', onClose);
            process.once('SIGINT', onClose);
        });
    }
    createJsdom(html) {
        return new jsdom_1.JSDOM(html, {
            runScripts: 'outside-only'
        });
    }
    async onParseHTML(event) {
        this._document = event.document;
        this._evaluate = this.createJsdom(event.html).window.eval;
        await (0, utils_dom_1.traverse)(this._document, this.engine, event.resource);
        const canEvaluateEvent = {
            document: this._document,
            resource: this._href
        };
        await this.engine.emitAsync('can-evaluate::script', canEvaluateEvent);
    }
    async fetchContent(target, headers, options) {
        const uri = (0, utils_network_1.getAsUri)(target);
        const filePath = uri ? (0, utils_network_1.asPathString)(uri) : '';
        const rawContent = options && options.content ? Buffer.from(options.content) : await readFileAsBuffer(filePath);
        const contentType = await (0, utils_1.getContentTypeData)(null, filePath, null, rawContent);
        let content = '';
        if ((0, utils_1.isTextMediaType)(contentType.mediaType || '')) {
            content = rawContent.toString(contentType.charset || undefined);
        }
        return {
            request: {},
            response: {
                body: {
                    content,
                    rawContent,
                    rawResponse() {
                        return Promise.resolve(rawContent);
                    }
                },
                charset: contentType.charset || '',
                headers: {},
                hops: [],
                mediaType: contentType.mediaType || '',
                statusCode: 200,
                url: uri ? url.format(uri) : ''
            }
        };
    }
    async collect(target, options) {
        if (target.protocol !== 'file:') {
            throw new Error('Connector local only works with local files or directories');
        }
        const href = this._href = target.href;
        const initialEvent = { resource: href };
        this.engine.emitAsync('scan::start', initialEvent);
        const pathString = (0, utils_network_1.asPathString)(target);
        let files;
        if ((0, utils_fs_1.isFile)(pathString)) {
            await this.engine.emitAsync('fetch::start::target', initialEvent);
            files = [pathString];
        }
        else {
            files = await globby(this.filesPattern, ({
                absolute: true,
                cwd: pathString,
                dot: true,
                gitignore: true
            }));
            if (options && options.content) {
                options.content = undefined;
            }
        }
        const events = await Promise.all(files.map((file) => {
            return this.fetchData(file, options);
        }));
        for (let i = 0; i < events.length; i++) {
            await this.notifyFetch(events[i]);
        }
        if (this._options.watch) {
            await this.watch(pathString);
        }
        else {
            await this.engine.emitAsync('scan::end', initialEvent);
        }
    }
    evaluate(source) {
        return this._evaluate ? this._evaluate(source) : Promise.resolve(null);
    }
    querySelectorAll(selector) {
        return this._document ? this._document.querySelectorAll(selector) : [];
    }
    close() {
        return Promise.resolve();
    }
    get dom() {
        return this._document && this._document;
    }
    get html() {
        return this._document ? this._document.pageHTML() : '';
    }
}
exports.default = LocalConnector;
LocalConnector.schema = {
    additionalProperties: false,
    properties: {
        pattern: {
            items: { type: 'string' },
            type: 'array'
        },
        watch: { type: 'boolean' }
    }
};
