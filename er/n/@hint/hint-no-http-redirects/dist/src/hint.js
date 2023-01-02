"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
class NoHttpRedirectHint {
    constructor(context) {
        const maxResourceHops = context.hintOptions && context.hintOptions['max-resource-redirects'] || 0;
        const maxHTMLHops = context.hintOptions && context.hintOptions['max-html-redirects'] || 0;
        const validateRequestEnd = (fetchEnd, eventName) => {
            const maxHops = eventName === 'fetch::end::html' ? maxHTMLHops : maxResourceHops;
            const { request, response, element } = fetchEnd;
            if (response.hops.length > maxHops) {
                const message = (0, i18n_import_1.getMessage)('redirectsDectected', context.language, maxHops.toString());
                context.report(request.url, message, { element, severity: utils_types_1.Severity.warning });
            }
        };
        context.on('fetch::end::*', validateRequestEnd);
    }
}
exports.default = NoHttpRedirectHint;
NoHttpRedirectHint.meta = meta_1.default;
