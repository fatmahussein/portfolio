"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_network_1 = require("@hint/utils-network");
const utils_string_1 = require("@hint/utils-string");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class NoHtmlOnlyHeadersHint {
    constructor(context) {
        let unneededHeaders = [
            'content-security-policy',
            'feature-policy',
            'x-content-security-policy',
            'x-ua-compatible',
            'x-webkit-csp',
            'x-xss-protection'
        ];
        const exceptionHeaders = [
            'content-security-policy',
            'x-content-security-policy',
            'x-webkit-csp'
        ];
        const exceptionMediaTypes = [
            'application/pdf',
            'image/svg+xml',
            'text/javascript'
        ];
        const loadHintConfigs = () => {
            const includeHeaders = (context.hintOptions && context.hintOptions.include) || [];
            const ignoreHeaders = (context.hintOptions && context.hintOptions.ignore) || [];
            unneededHeaders = (0, utils_string_1.mergeIgnoreIncludeArrays)(unneededHeaders, ignoreHeaders, includeHeaders);
        };
        const willBeTreatedAsHTML = (response) => {
            const contentTypeHeader = response.headers['content-type'];
            const mediaType = contentTypeHeader ? contentTypeHeader.split(';')[0].trim() : '';
            if ([
                'text/html',
                'text/xml',
                'application/xhtml+xml'
            ].includes(mediaType)) {
                return true;
            }
            if (mediaType.indexOf('/') > 0) {
                return false;
            }
            return false;
        };
        const validate = ({ element, resource, response }) => {
            if ((0, utils_network_1.isDataURI)(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);
                return;
            }
            if (!willBeTreatedAsHTML(response)) {
                let headersToValidate = unneededHeaders;
                if (exceptionMediaTypes.includes(response.mediaType)) {
                    headersToValidate = (0, utils_string_1.mergeIgnoreIncludeArrays)(headersToValidate, exceptionHeaders, []);
                }
                const headers = (0, utils_network_1.includedHeaders)(response.headers, headersToValidate);
                const numberOfHeaders = headers.length;
                if (numberOfHeaders > 0) {
                    const message = (0, i18n_import_1.getMessage)('unneededHeaders', context.language, headers.join(', '));
                    context.report(resource, message, { element, severity: utils_types_1.Severity.warning });
                }
            }
        };
        loadHintConfigs();
        context.on('fetch::end::*', validate);
    }
}
exports.default = NoHtmlOnlyHeadersHint;
NoHtmlOnlyHeadersHint.meta = meta_1.default;
