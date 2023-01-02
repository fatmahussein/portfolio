"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uniqBy = require("lodash/uniqBy");
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class HtmlCheckerHint {
    constructor(context) {
        let htmlCheckerPromises = [];
        let ignoredMessages;
        const scanOptions = {
            body: '',
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'User-Agent': 'hint'
            },
            method: 'POST',
            qs: { out: 'json' },
            url: ''
        };
        let groupMessage;
        const loadHintConfig = () => {
            const ignore = (context.hintOptions && context.hintOptions.ignore) || [];
            const validator = (context.hintOptions && context.hintOptions.validator) || 'https://validator.w3.org/nu/';
            groupMessage = !(context.hintOptions && context.hintOptions.details);
            scanOptions.url = validator;
            ignoredMessages = Array.isArray(ignore) ? ignore : [ignore];
        };
        const filter = (messages) => {
            const noIgnoredMesssages = messages.filter((message) => {
                return !ignoredMessages.includes(message.message);
            });
            if (!groupMessage) {
                return noIgnoredMesssages;
            }
            return uniqBy(noIgnoredMesssages, 'message');
        };
        const toSeverity = (message) => {
            if (message.type === 'info') {
                if (message.subType === 'warning') {
                    return utils_types_1.Severity.warning;
                }
                return utils_types_1.Severity.information;
            }
            if (message.type === 'error') {
                return utils_types_1.Severity.error;
            }
            return utils_types_1.Severity.warning;
        };
        const locateAndReport = (resource) => {
            return (messageItem) => {
                const position = {
                    column: messageItem.firstColumn,
                    elementColumn: messageItem.hiliteStart + 1,
                    elementLine: 1,
                    line: messageItem.lastLine
                };
                context.report(resource, messageItem.message, {
                    codeLanguage: 'html',
                    codeSnippet: messageItem.extract,
                    location: position,
                    severity: toSeverity(messageItem)
                });
            };
        };
        const notifyError = (resource, error) => {
            debug(`Error getting HTML checker result for ${resource}.`, error);
            context.report(resource, (0, i18n_import_1.getMessage)('couldNotGetResult', context.language, [resource, error.message]), { severity: utils_types_1.Severity.warning });
        };
        const requestRetry = async (url, options, retries = 3) => {
            const requestAsync = (await Promise.resolve().then(() => require('@hint/utils-network'))).requestAsync;
            const delay = (await Promise.resolve().then(() => require('@hint/utils'))).delay;
            try {
                return await requestAsync(url, options);
            }
            catch (e) {
                if (retries === 0) {
                    throw e;
                }
                await delay(500);
                return await requestRetry(url, options, retries - 1);
            }
        };
        const checkHTML = (data) => {
            const options = Object.assign(Object.assign({}, scanOptions), { body: data.html });
            return {
                event: data,
                failed: false,
                promise: options.body ? requestRetry(options.url, options) : Promise.resolve({ messages: [] })
            };
        };
        const start = (data) => {
            const check = checkHTML(data);
            htmlCheckerPromises.push(check);
        };
        const end = async () => {
            if (htmlCheckerPromises.length === 0) {
                return;
            }
            for (const check of htmlCheckerPromises) {
                if (check.failed) {
                    return;
                }
                const { resource } = check.event;
                const locateAndReportByResource = locateAndReport(resource);
                let result;
                debug(`Waiting for HTML checker results for ${resource}`);
                try {
                    result = JSON.parse(await check.promise);
                }
                catch (e) {
                    notifyError(resource, e);
                    return;
                }
                debug(`Received HTML checker results for ${resource}`);
                const filteredMessages = filter(result.messages);
                try {
                    filteredMessages.forEach((messageItem) => {
                        locateAndReportByResource(messageItem);
                    });
                }
                catch (e) {
                    debug(`Error reporting the HTML checker results.`, e);
                    return;
                }
            }
            htmlCheckerPromises = [];
        };
        loadHintConfig();
        context.on('parse::end::html', start);
        context.on('scan::end', end);
    }
}
exports.default = HtmlCheckerHint;
HtmlCheckerHint.meta = meta_1.default;
