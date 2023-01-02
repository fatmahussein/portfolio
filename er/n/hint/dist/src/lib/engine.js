"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
const url = require("url");
require('setimmediate');
const chalk = require("chalk");
const eventemitter2_1 = require("eventemitter2");
const remove = require("lodash/remove");
const logger = require("@hint/utils/dist/src/logging");
const utils_debug_1 = require("@hint/utils-debug");
const config_hints_1 = require("./config/config-hints");
const hint_context_1 = require("./hint-context");
const hint_scope_1 = require("./enums/hint-scope");
const debug = (0, utils_debug_1.debug)(__filename);
class Engine extends eventemitter2_1.EventEmitter2 {
    constructor(config, resources) {
        super({
            delimiter: '::',
            maxListeners: 0,
            wildcard: true
        });
        this.browserslist = [];
        this._timeout = 60000;
        debug('Initializing hint engine');
        this._timeout = config.hintsTimeout;
        this.messages = [];
        this.browserslist = config.browserslist;
        this.ignoredUrls = config.ignoredUrls;
        this._lang = config.language;
        const Connector = resources.connector;
        const connectorId = config.connector && config.connector.name;
        if (!Connector) {
            throw new Error(`Connector "${connectorId}" not found`);
        }
        this.connector = new Connector(this, config.connector && config.connector.options);
        this._formatters = resources.formatters.map((Formatter) => {
            return new Formatter();
        });
        this.parsers = resources.parsers.map((ParserConstructor) => {
            debug(`Loading parser`);
            return new ParserConstructor(this);
        });
        debug(`Parsers loaded: ${this.parsers.length}`);
        this.hints = new Map();
        const getHintConfig = (id) => {
            if (config.hints[id]) {
                return config.hints[id];
            }
            const hintEntries = Object.keys(config.hints);
            const idParts = id.split('/');
            const hintKey = hintEntries.find((entry) => {
                return idParts.every((idPart) => {
                    return entry.includes(idPart);
                });
            });
            return config.hints[hintKey || ''];
        };
        resources.hints.forEach((Hint) => {
            debug('Loading hints');
            const id = Hint.meta.id;
            if (Hint.meta.ignoredUrls && !this.ignoredUrls.has(id)) {
                this.ignoredUrls.set(id, Hint.meta.ignoredUrls);
            }
            const ignoreHint = (HintCtor) => {
                const ignoredConnectors = HintCtor.meta.ignoredConnectors || [];
                return (connectorId === 'local' && HintCtor.meta.scope === hint_scope_1.HintScope.site) ||
                    (connectorId !== 'local' && HintCtor.meta.scope === hint_scope_1.HintScope.local) ||
                    ignoredConnectors.includes(connectorId || '');
            };
            const getIgnoredUrls = () => {
                const urlsIgnoredForAll = this.ignoredUrls.get('all') || [];
                const urlsIgnoredForHint = this.ignoredUrls.get(id) || [];
                return urlsIgnoredForAll.concat(urlsIgnoredForHint);
            };
            const hintOptions = getHintConfig(id);
            const severity = (0, config_hints_1.getSeverity)(hintOptions);
            if (ignoreHint(Hint)) {
                debug(`Hint "${id}" is disabled for the connector "${connectorId}"`);
                logger.log(chalk.yellow(`Warning: The hint "${id}" will be ignored for the connector "${connectorId}"`));
            }
            else if (severity) {
                const context = new hint_context_1.HintContext(id, this, severity, hintOptions, Hint.meta, getIgnoredUrls());
                const hint = new Hint(context);
                this.hints.set(id, hint);
            }
            else {
                debug(`Hint "${id}" is disabled`);
            }
        });
    }
    get pageDOM() {
        return this.connector.dom;
    }
    get pageContent() {
        return this.connector.html;
    }
    get pageHeaders() {
        return this.connector.headers;
    }
    get targetedBrowsers() {
        return this.browserslist;
    }
    get formatters() {
        return this._formatters;
    }
    get timeout() {
        return this._timeout;
    }
    isIgnored(urls, resource) {
        if (!urls) {
            return false;
        }
        return urls.some((urlIgnored) => {
            return urlIgnored.test(resource);
        });
    }
    onHintEvent(id, eventName, listener) {
        const that = this;
        const createEventHandler = (handler, hintId) => {
            return function (event) {
                const urlsIgnoredForAll = that.ignoredUrls.get('all') || [];
                const urlsIgnoredForHint = that.ignoredUrls.get(hintId) || [];
                const urlsIgnored = urlsIgnoredForHint.concat(urlsIgnoredForAll);
                const eventName = this.event;
                if (that.isIgnored(urlsIgnored, event.resource)) {
                    return null;
                }
                return new Promise((resolve, reject) => {
                    let immediateId;
                    const timeoutId = setTimeout(() => {
                        if (immediateId) {
                            clearImmediate(immediateId);
                            immediateId = null;
                        }
                        debug(`Hint ${hintId} timeout`);
                        resolve(null);
                    }, that._timeout);
                    immediateId = setImmediate(async () => {
                        try {
                            const result = await handler(event, eventName);
                            if (timeoutId) {
                                clearTimeout(timeoutId);
                            }
                            resolve(result);
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                });
            };
        };
        this.on(eventName, createEventHandler(listener, id));
    }
    fetchContent(target, headers) {
        return this.connector.fetchContent(target, headers);
    }
    evaluate(source) {
        return this.connector.evaluate(source);
    }
    async close() {
        await this.connector.close();
    }
    report(problem) {
        this.messages.push(problem);
    }
    clean(fileUrl) {
        const file = url.format(fileUrl);
        remove(this.messages, (message) => {
            return message.resource === file;
        });
    }
    clear() {
        this.messages = [];
    }
    async notify(resource) {
        await this.emitAsync('print', {
            problems: this.messages,
            resource
        });
    }
    async executeOn(target, options) {
        const start = Date.now();
        debug(`Starting the analysis on ${target.href}`);
        await this.connector.collect(target, options);
        debug(`Total runtime ${Date.now() - start}`);
        return this.messages;
    }
    querySelectorAll(selector) {
        return this.connector.querySelectorAll(selector);
    }
    emit(event, data) {
        return super.emit(event, data);
    }
    emitAsync(event, data) {
        const ignoredUrls = this.ignoredUrls.get('all') || [];
        if (this.isIgnored(ignoredUrls, data.resource)) {
            return Promise.resolve([]);
        }
        return super.emitAsync(event, data);
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    get language() {
        return this._lang;
    }
}
exports.Engine = Engine;
