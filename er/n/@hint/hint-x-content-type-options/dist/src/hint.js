"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_string_1 = require("@hint/utils-string");
const utils_network_1 = require("@hint/utils-network");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class XContentTypeOptionsHint {
    constructor(context) {
        const validate = ({ element, resource, response }) => {
            if ((0, utils_network_1.isDataURI)(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);
                return;
            }
            const headerValue = (0, utils_string_1.normalizeString)(response.headers && response.headers['x-content-type-options']);
            if (headerValue === null) {
                context.report(resource, (0, i18n_import_1.getMessage)('shouldInclude', context.language), {
                    element,
                    severity: utils_types_1.Severity.error
                });
                return;
            }
            if (headerValue !== 'nosniff') {
                context.report(resource, (0, i18n_import_1.getMessage)('nosniff', context.language), {
                    codeLanguage: 'http',
                    codeSnippet: `X-Content-Type-Options: ${headerValue}`,
                    element,
                    severity: utils_types_1.Severity.error
                });
                return;
            }
            return;
        };
        context.on('fetch::end::*', validate);
    }
}
exports.default = XContentTypeOptionsHint;
XContentTypeOptionsHint.meta = meta_1.default;
