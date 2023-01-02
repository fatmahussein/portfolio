"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestJSONAsyncMock = exports.htmlPageWithManifestData = exports.htmlPageWithScriptData = exports.generateHTMLPageData = exports.faviconHeaderMaxAgeOnly = exports.problemWithVerificationEndpoint = exports.preloadableServiceError = exports.statusServiceError = exports.wrongFormatError = exports.tooShortErrorDefault = exports.duplicateDirectivesError = exports.noMaxAgeError = exports.noHeaderError = exports.generateTooShortError = exports.hasErrors = exports.noErrors = exports.unknown = exports.preloaded = exports.notPreloadableError = exports.includeUnitMaxAgeHeader = exports.wrongDelimiterHeader = exports.multipleincludeSubDomainsHeader = exports.multipleMaxAgeHeader = exports.noMaxAgeHeader = exports.tooShortHeader = exports.quotedStringHeader = exports.mixCaseHeader = exports.preloadHeader = exports.includeSubDomainsHeader = exports.maxAgeOnlyHeader = exports.stsHeader = exports.defaultMinimum = exports.smallMaxAge = exports.OkayMaxAge = void 0;
const utils_create_server_1 = require("@hint/utils-create-server");
exports.OkayMaxAge = 31536000;
exports.smallMaxAge = 1;
exports.defaultMinimum = 10886400;
exports.stsHeader = 'strict-transport-security';
exports.maxAgeOnlyHeader = { [exports.stsHeader]: `max-age=${exports.OkayMaxAge}` };
exports.includeSubDomainsHeader = { [exports.stsHeader]: `max-age=${exports.OkayMaxAge}; includeSubDomains` };
exports.preloadHeader = { [exports.stsHeader]: `max-age=${exports.OkayMaxAge}; includeSubDomains; preload` };
exports.mixCaseHeader = { [exports.stsHeader]: `Max-Age=${exports.OkayMaxAge}` };
exports.quotedStringHeader = { [exports.stsHeader]: `max-age="${exports.OkayMaxAge}"; includeSubDomains; preload` };
exports.tooShortHeader = { [exports.stsHeader]: `max-age=${exports.smallMaxAge}` };
exports.noMaxAgeHeader = { [exports.stsHeader]: `maxage=${exports.OkayMaxAge}; includeSubDomains; preload` };
exports.multipleMaxAgeHeader = { [exports.stsHeader]: `max-age=${exports.OkayMaxAge}; max-age=${exports.OkayMaxAge + 1}` };
exports.multipleincludeSubDomainsHeader = { [exports.stsHeader]: `includeSubDomains; max-age=${exports.OkayMaxAge}; includeSubDomains` };
exports.wrongDelimiterHeader = { [exports.stsHeader]: `max-age=${exports.OkayMaxAge}, includeSubDomains; preload` };
exports.includeUnitMaxAgeHeader = { [exports.stsHeader]: `max-age=${exports.OkayMaxAge}s; includeSubDomains; preload` };
exports.notPreloadableError = `www subdomain does not support HTTPS`;
exports.preloaded = { status: 'preloaded' };
exports.unknown = { status: 'unknown' };
exports.noErrors = { errors: [] };
exports.hasErrors = { errors: [{ message: exports.notPreloadableError }] };
const generateTooShortError = (value) => {
    return `The '${exports.stsHeader}' header 'max-age' value should be more than '${value}'.`;
};
exports.generateTooShortError = generateTooShortError;
exports.noHeaderError = `The '${exports.stsHeader}' header was not specified.`;
exports.noMaxAgeError = `The '${exports.stsHeader}' header requires 'max-age' directive.`;
exports.duplicateDirectivesError = `The '${exports.stsHeader}' header contains duplicate directives.`;
exports.tooShortErrorDefault = (0, exports.generateTooShortError)(exports.defaultMinimum);
exports.wrongFormatError = `The '${exports.stsHeader}' header has the wrong format.`;
exports.statusServiceError = `Error getting preload status.`;
exports.preloadableServiceError = `Error getting preload eligibility.`;
exports.problemWithVerificationEndpoint = `Error getting preload status.`;
exports.faviconHeaderMaxAgeOnly = {
    '/': { content: (0, utils_create_server_1.generateHTMLPage)() },
    '/favicon.ico': { headers: { [exports.stsHeader]: `max-age=${exports.OkayMaxAge + 100}` } }
};
const generateHTMLPageData = (content) => {
    return {
        content,
        headers: exports.maxAgeOnlyHeader
    };
};
exports.generateHTMLPageData = generateHTMLPageData;
exports.htmlPageWithScriptData = (0, exports.generateHTMLPageData)((0, utils_create_server_1.generateHTMLPage)(undefined, '<script src="test.js"></script>'));
exports.htmlPageWithManifestData = (0, exports.generateHTMLPageData)((0, utils_create_server_1.generateHTMLPage)('<link rel="manifest" href="test.webmanifest">'));
const requestJSONAsyncMock = (responseObject) => {
    const isHTTPS = () => {
        return true;
    };
    const isRegularProtocol = () => {
        return true;
    };
    const normalizeString = (str = '') => {
        return str.toLowerCase();
    };
    const requestJSONAsync = (uri) => {
        let response;
        if (uri.includes('/api/v2/preloadable')) {
            response = responseObject.preloadable;
        }
        else {
            response = responseObject.status;
        }
        if (!response) {
            return Promise.reject(new Error('Error with the verification service.'));
        }
        return Promise.resolve(response);
    };
    return {
        '@hint/utils-network': {
            isHTTPS,
            isRegularProtocol,
            requestJSONAsync
        },
        '@hint/utils-string': { normalizeString }
    };
};
exports.requestJSONAsyncMock = requestJSONAsyncMock;
