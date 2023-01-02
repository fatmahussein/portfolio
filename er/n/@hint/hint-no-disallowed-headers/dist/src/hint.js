"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_string_1 = require("@hint/utils-string");
const utils_network_1 = require("@hint/utils-network");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
const serverHeaderContainsTooMuchInformation = (serverHeaderValue) => {
    const regex = [
        /\/?v?\d\.(\d+\.?)*/,
        /\(.*\)/,
        /(mod_|openssl|php)/
    ];
    return regex.some((r) => {
        return r.test(serverHeaderValue);
    });
};
class NoDisallowedHeadersHint {
    constructor(context) {
        let generalDisallowedHeaders = [
            'public-key-pins',
            'public-key-pins-report-only',
            'x-aspnet-version',
            'x-aspnetmvc-version',
            'x-powered-by',
            'x-runtime',
            'x-version'
        ];
        const specialDisallowedHeaders = {
            expires: 'disallowedExpiresHeader',
            host: 'disallowedHostHeader',
            p3p: 'disallowedP3PHeader',
            pragma: 'disallowedPragmaHeader',
            'x-frame-options': 'disallowedXFrameOptionsHeader'
        };
        let includeHeaders;
        let ignoreHeaders;
        const loadHintConfigs = () => {
            includeHeaders = (context.hintOptions && context.hintOptions.include) || [];
            ignoreHeaders = (context.hintOptions && context.hintOptions.ignore) || [];
            generalDisallowedHeaders = (0, utils_string_1.mergeIgnoreIncludeArrays)(generalDisallowedHeaders, ignoreHeaders, includeHeaders);
        };
        const validateGeneralHeaders = ({ response, resource }) => {
            const headers = (0, utils_network_1.includedHeaders)(response.headers, generalDisallowedHeaders);
            const numberOfHeaders = headers.length;
            if (numberOfHeaders > 0) {
                const message = (0, i18n_import_1.getMessage)('disallowedHeaders', context.language, headers.join(', '));
                const codeSnippet = headers.reduce((total, header) => {
                    return `${total}${total ? '\n' : ''}${header}: ${(0, utils_network_1.normalizeHeaderValue)(response.headers, header)}`;
                }, '');
                const codeLanguage = 'http';
                context.report(resource, message, {
                    codeLanguage, codeSnippet,
                    severity: utils_types_1.Severity.warning
                });
            }
        };
        const validateServerHeader = ({ response, resource }) => {
            const serverHeaderValue = (0, utils_network_1.normalizeHeaderValue)(response.headers, 'server');
            const codeLanguage = 'http';
            if (!generalDisallowedHeaders.includes('server') &&
                !(0, utils_string_1.toLowerCaseArray)(ignoreHeaders).includes('server') &&
                serverHeaderValue &&
                serverHeaderContainsTooMuchInformation(serverHeaderValue)) {
                const message = (0, i18n_import_1.getMessage)('headerValueShouldOnlyContain', context.language);
                context.report(resource, message, {
                    codeLanguage,
                    codeSnippet: `Server: ${serverHeaderValue}`,
                    severity: utils_types_1.Severity.warning
                });
            }
        };
        const validateSpecialHeaders = ({ response, resource }) => {
            const codeLanguage = 'http';
            for (const key of Object.keys(response.headers)) {
                const lowercaseKey = key.toLowerCase();
                const messageName = specialDisallowedHeaders[lowercaseKey];
                if (messageName && !(0, utils_string_1.toLowerCaseArray)(ignoreHeaders).includes(lowercaseKey)) {
                    const message = (0, i18n_import_1.getMessage)(messageName, context.language);
                    const headerValue = (0, utils_network_1.normalizeHeaderValue)(response.headers, lowercaseKey);
                    context.report(resource, message, {
                        codeLanguage,
                        codeSnippet: `${key}: ${headerValue}`,
                        severity: utils_types_1.Severity.warning
                    });
                }
            }
        };
        const validate = (event) => {
            if ((0, utils_network_1.isDataURI)(event.resource)) {
                debug(`Check does not apply for data URI: ${event.resource}`);
                return;
            }
            validateGeneralHeaders(event);
            validateServerHeader(event);
            validateSpecialHeaders(event);
        };
        loadHintConfigs();
        context.on('fetch::end::*', validate);
    }
}
exports.default = NoDisallowedHeadersHint;
NoDisallowedHeadersHint.meta = meta_1.default;
