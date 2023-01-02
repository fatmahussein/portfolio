"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
const url_1 = require("url");
const utils_network_1 = require("@hint/utils-network");
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class StrictTransportSecurityHint {
    constructor(context) {
        let minMaxAgeValue;
        let checkPreload;
        const statusApiEndPoint = `https://hstspreload.org/api/v2/status?domain=`;
        const preloadableApiEndPoint = `https://hstspreload.org/api/v2/preloadable?domain=`;
        const unsupportedDomains = new Set();
        const { isHTTPS, requestJSONAsync } = require('@hint/utils-network');
        const { normalizeString } = require('@hint/utils-string');
        const loadHintConfigs = () => {
            minMaxAgeValue = (context.hintOptions && context.hintOptions.minMaxAgeValue) || 10886400;
            checkPreload = (context.hintOptions && context.hintOptions.checkPreload);
        };
        const parse = (headerValue) => {
            const parsedHeader = {};
            const directives = headerValue.toLowerCase().split(';');
            const nameValuePairRegex = /^ *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[~0-9])*"|[!#$%&'*+.^_`|~0-9]+) *$/;
            const tokenRegex = /^ *[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
            for (const directive of directives) {
                const match = tokenRegex.exec(directive) || nameValuePairRegex.exec(directive);
                if (!match) {
                    return {
                        error: {
                            message: (0, i18n_import_1.getMessage)('wrongFormat', context.language),
                            severity: utils_types_1.Severity.error
                        }
                    };
                }
                const [matchString, key, value] = match;
                const name = key || matchString.trim();
                if (parsedHeader[name]) {
                    return {
                        error: {
                            message: (0, i18n_import_1.getMessage)('moreThanOneName', context.language),
                            severity: utils_types_1.Severity.warning
                        }
                    };
                }
                parsedHeader[name] = value || 'true';
            }
            return { parsedHeader };
        };
        const isUnderAgeLimit = (maxAge, limit) => {
            return !!maxAge && parseInt(maxAge) < limit;
        };
        const isPreloaded = (hostname) => {
            debug(`Waiting to get preload status for ${hostname}`);
            return requestJSONAsync(`${statusApiEndPoint}${hostname}`);
        };
        const issuesToPreload = (hostname) => {
            debug(`Waiting to get preload eligibility for ${hostname}`);
            return requestJSONAsync(`${preloadableApiEndPoint}${hostname}`);
        };
        const verifyPreload = async (resource) => {
            const originalDomain = new url_1.URL(resource).hostname;
            const mainDomain = originalDomain.replace(/^www./, '');
            let status;
            let issues = {};
            try {
                ({ status } = await isPreloaded(mainDomain) || await isPreloaded(originalDomain));
            }
            catch (err) {
                const message = (0, i18n_import_1.getMessage)('errorPreloadStatus', context.language);
                debug(message, err);
                context.report(resource, message, { severity: utils_types_1.Severity.error });
                return issues;
            }
            debug(`Received preload status for ${resource}.`);
            if (!status) {
                const message = (0, i18n_import_1.getMessage)('errorPreloadStatus', context.language);
                debug(message);
                context.report(resource, message, { severity: utils_types_1.Severity.warning });
                return issues;
            }
            if (status !== 'preloaded') {
                try {
                    issues = await issuesToPreload(mainDomain);
                }
                catch (err) {
                    const message = (0, i18n_import_1.getMessage)('errorPreloadEligibility', context.language);
                    debug(message, err);
                    context.report(resource, message, { severity: utils_types_1.Severity.error });
                }
                debug(`Received preload eligibility for ${resource}.`);
            }
            return issues;
        };
        const validate = async ({ element, resource, response }) => {
            if (!(0, utils_network_1.isRegularProtocol)(resource)) {
                debug(`Check does not apply for non HTTP(s) URIs`);
                return;
            }
            const headerValue = normalizeString(response.headers && response.headers['strict-transport-security']);
            if (!isHTTPS(resource) && headerValue) {
                const message = (0, i18n_import_1.getMessage)('noOverHTTP', context.language);
                context.report(resource, message, {
                    codeLanguage: 'http',
                    codeSnippet: `Strict-Transport-Security: ${headerValue}`,
                    element,
                    severity: utils_types_1.Severity.warning
                });
                return;
            }
            if (!isHTTPS(resource) && !headerValue) {
                const urlObject = new url_1.URL(resource);
                if (unsupportedDomains.has(urlObject.host)) {
                    debug(`${resource} ignored because the domain ${urlObject.host} does not support HTTPS.`);
                    return;
                }
                const httpsResource = url.format(Object.assign(Object.assign({}, urlObject), { protocol: `https` }));
                try {
                    const networkData = await context.fetchContent(httpsResource);
                    if (!networkData || !networkData.response) {
                        return;
                    }
                    if (networkData.response.statusCode === 200) {
                        validate({
                            element: null,
                            request: networkData.request,
                            resource: httpsResource,
                            response: networkData.response
                        });
                    }
                }
                catch (err) {
                    debug(`${resource} doesn't support HTTPS`);
                    unsupportedDomains.add(urlObject.host);
                }
                return;
            }
            if (!headerValue) {
                context.report(resource, (0, i18n_import_1.getMessage)('noHeader', context.language), {
                    element,
                    severity: utils_types_1.Severity.error
                });
                return;
            }
            const { error, parsedHeader } = parse(headerValue);
            if (error) {
                context.report(resource, error.message, {
                    element,
                    severity: error.severity
                });
                return;
            }
            if (!parsedHeader) {
                return;
            }
            if (checkPreload && parsedHeader.preload) {
                const { errors } = await verifyPreload(resource);
                if (errors) {
                    for (const error of errors) {
                        context.report(resource, error.message, { element, severity: utils_types_1.Severity.error });
                    }
                    return;
                }
            }
            const maxAge = parsedHeader['max-age'];
            if (!maxAge) {
                const message = (0, i18n_import_1.getMessage)('requiresMaxAge', context.language);
                context.report(resource, message, { element, severity: utils_types_1.Severity.error });
                return;
            }
            if (isUnderAgeLimit(maxAge, minMaxAgeValue)) {
                const message = (0, i18n_import_1.getMessage)('wrongMaxAge', context.language, minMaxAgeValue.toString());
                context.report(resource, message, {
                    codeLanguage: 'http',
                    codeSnippet: `Strict-Transport-Security: ${headerValue}`,
                    element,
                    severity: utils_types_1.Severity.warning
                });
                return;
            }
        };
        loadHintConfigs();
        context.on('fetch::end::*', validate);
    }
}
exports.default = StrictTransportSecurityHint;
StrictTransportSecurityHint.meta = meta_1.default;
