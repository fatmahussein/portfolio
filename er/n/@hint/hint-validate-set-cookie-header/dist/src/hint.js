"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_string_1 = require("@hint/utils-string");
const utils_network_1 = require("@hint/utils-network");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class ValidateSetCookieHeaderHint {
    constructor(context) {
        let supportOlderBrowsers;
        const acceptedCookieAttributes = ['expires', 'max-age', 'domain', 'path', 'secure', 'httponly', 'samesite', 'priority'];
        const illegalCookieNameChars = '()<>@,;:\\"/[]?={}';
        const illegalCookieValueChars = ',;"\\';
        const unquote = (value) => {
            return value.replace(/(^")|("$)/g, '');
        };
        const unquoteAfterSplitByEqual = (splitResult) => {
            const [key, ...value] = splitResult;
            return [key, unquote(value.join('='))];
        };
        const normalizeAfterSplitByEqual = (splitResult) => {
            const [key, value] = unquoteAfterSplitByEqual(splitResult);
            return [(0, utils_string_1.normalizeString)(key), value];
        };
        const parse = (setCookieValue) => {
            const [nameValuePair, ...directivePairs] = setCookieValue.split(';');
            const [cookieName, cookieValue] = unquoteAfterSplitByEqual(nameValuePair.split('='));
            const setCookie = {
                name: cookieName,
                value: cookieValue
            };
            const errors = [];
            if (directivePairs[directivePairs.length - 1] === '') {
                errors.push({
                    message: (0, i18n_import_1.getMessage)('noTrilingSemicolon', context.language),
                    severity: utils_types_1.Severity.hint
                });
                directivePairs.pop();
            }
            directivePairs.forEach((part) => {
                const [directiveKey, directiveValue] = normalizeAfterSplitByEqual(part.split('='));
                let ok = true;
                if (!acceptedCookieAttributes.includes(directiveKey)) {
                    errors.push({
                        message: (0, i18n_import_1.getMessage)('unknownAttribute', context.language, directiveKey),
                        severity: utils_types_1.Severity.warning
                    });
                    ok = false;
                }
                if (setCookie[directiveKey]) {
                    errors.push({
                        message: (0, i18n_import_1.getMessage)('duplicatedDirective', context.language),
                        severity: utils_types_1.Severity.warning
                    });
                    ok = false;
                }
                if (ok) {
                    setCookie[directiveKey] = directiveValue || true;
                }
            });
            return { errors, setCookie };
        };
        const validASCII = (string) => {
            return (/^[\x00-\x7F]+$/).test(string);
        };
        const validString = (name, illegalChars) => {
            const includesIllegalChars = illegalChars.split('').some((char) => {
                return name.includes(char);
            });
            const includesWhiteSpace = (/\s/g).test(name);
            return validASCII(name) && !includesIllegalChars && !includesWhiteSpace;
        };
        const validateNameAndValue = (parsedSetCookie) => {
            const cookieName = parsedSetCookie.name;
            const errors = [];
            const noNameValueStringError = (0, i18n_import_1.getMessage)('noNameValueString', context.language);
            const invalidNameError = (0, i18n_import_1.getMessage)('invalidName', context.language);
            const invalidValueError = (0, i18n_import_1.getMessage)('invalidValue', context.language);
            const severity = utils_types_1.Severity.error;
            if (!cookieName || acceptedCookieAttributes.includes((0, utils_string_1.normalizeString)(cookieName))) {
                errors.push({ message: noNameValueStringError, severity });
                return errors;
            }
            if (!validString(cookieName, illegalCookieNameChars)) {
                errors.push({ message: invalidNameError, severity });
            }
            if (!validString(parsedSetCookie.value, illegalCookieValueChars)) {
                errors.push({ message: invalidValueError, severity });
            }
            return errors;
        };
        const validatePrefixes = (parsedSetCookie) => {
            const normalizedCookieName = (0, utils_string_1.normalizeString)(parsedSetCookie.name);
            const resource = parsedSetCookie.resource || '';
            const errors = [];
            const hasPrefixHttpError = (0, i18n_import_1.getMessage)('hasPrefixHttp', context.language);
            const noPathHasHostPrefixError = (0, i18n_import_1.getMessage)('noPathHasHostPrefix', context.language);
            const hasDomainHostPrefixError = (0, i18n_import_1.getMessage)('hasDomainHostPrefix', context.language);
            if ((normalizedCookieName.startsWith('__secure-') || normalizedCookieName.startsWith('__host-')) && !(0, utils_network_1.isHTTPS)(resource)) {
                errors.push({ message: hasPrefixHttpError, severity: utils_types_1.Severity.error });
            }
            if (normalizedCookieName.startsWith('__host-')) {
                if (!parsedSetCookie.path || parsedSetCookie.path !== '/') {
                    errors.push({ message: noPathHasHostPrefixError, severity: utils_types_1.Severity.error });
                }
                if (parsedSetCookie.domain) {
                    errors.push({ message: hasDomainHostPrefixError, severity: utils_types_1.Severity.error });
                }
            }
            return errors;
        };
        const validateSecurityAttributes = (parsedSetCookie) => {
            const resource = parsedSetCookie.resource || '';
            const errors = [];
            const hasSecureHttpError = (0, i18n_import_1.getMessage)('hasSecureHttp', context.language);
            const noSecureError = (0, i18n_import_1.getMessage)('noSecure', context.language);
            const noHttpOnlyError = (0, i18n_import_1.getMessage)('noHttpOnly', context.language);
            if (!(0, utils_network_1.isHTTPS)(resource) && parsedSetCookie.secure) {
                errors.push({ message: hasSecureHttpError, severity: utils_types_1.Severity.error });
                return errors;
            }
            if (!parsedSetCookie.secure) {
                errors.push({ message: noSecureError, severity: utils_types_1.Severity.error });
            }
            if (!parsedSetCookie.httponly) {
                errors.push({ message: noHttpOnlyError, severity: utils_types_1.Severity.warning });
            }
            return errors;
        };
        const validateExpireDate = (parsedSetCookie) => {
            const errors = [];
            if (!parsedSetCookie.expires) {
                return errors;
            }
            const expiresDate = new Date(parsedSetCookie.expires);
            const expiresYear = expiresDate.getFullYear();
            if (expiresYear < 0) {
                expiresDate.setFullYear(Math.abs(expiresYear));
            }
            const utcTimeString = expiresDate.toUTCString();
            const invalidDateError = (0, i18n_import_1.getMessage)('invalidDate', context.language);
            const invalidDateFormatError = (0, i18n_import_1.getMessage)('invalidDateFormat', context.language, utcTimeString);
            if (utcTimeString === 'Invalid Date') {
                errors.push({ message: invalidDateError, severity: utils_types_1.Severity.error });
                return errors;
            }
            if ((0, utils_string_1.normalizeString)(utcTimeString) !== (0, utils_string_1.normalizeString)(parsedSetCookie.expires)) {
                errors.push({ message: invalidDateFormatError, severity: utils_types_1.Severity.warning });
            }
            return errors;
        };
        const validateMaxAgeAndExpires = (parsedSetCookie) => {
            const errors = [];
            const maxAgeCompatibilityMessage = (0, i18n_import_1.getMessage)('maxAgeCompatibility', context.language);
            const maxAgeAndExpireDuplicateMessage = (0, i18n_import_1.getMessage)('maxAgeAndExpireDuplicate', context.language);
            if (supportOlderBrowsers) {
                if (parsedSetCookie['max-age'] && !parsedSetCookie.expires) {
                    errors.push({ message: maxAgeCompatibilityMessage, severity: utils_types_1.Severity.error });
                }
                return errors;
            }
            if (parsedSetCookie['max-age'] && parsedSetCookie.expires) {
                errors.push({ message: maxAgeAndExpireDuplicateMessage, severity: utils_types_1.Severity.hint });
            }
            return errors;
        };
        const loadHintConfigs = () => {
            supportOlderBrowsers = ['ie 6', 'ie 7', 'ie 8'].some((e) => {
                return context.targetedBrowsers.includes(e);
            });
        };
        const validate = ({ element, resource, response }) => {
            const defaultValidators = [
                validateNameAndValue,
                validatePrefixes,
                validateSecurityAttributes,
                validateExpireDate,
                validateMaxAgeAndExpires
            ];
            if (!(0, utils_network_1.isRegularProtocol)(resource)) {
                debug(`Check does not apply for URI: ${resource}`);
                return;
            }
            const rawSetCookieHeaders = response.headers && response.headers['set-cookie'] || '';
            if (!rawSetCookieHeaders) {
                return;
            }
            const setCookieHeaders = Array.isArray(rawSetCookieHeaders) ? rawSetCookieHeaders : rawSetCookieHeaders.split(/\n|\r\n/);
            const reportBatch = (errorMessages, codeLanguage, codeSnippet) => {
                errorMessages.forEach(({ message, severity }) => {
                    context.report(resource, message, {
                        codeLanguage,
                        codeSnippet,
                        element,
                        severity
                    });
                });
            };
            for (const setCookieHeader of setCookieHeaders) {
                const codeSnippet = `Set-Cookie: ${setCookieHeader}`;
                const codeLanguage = 'http';
                const { errors, setCookie: parsedSetCookie } = parse(setCookieHeader);
                if (errors) {
                    for (const { message, severity } of errors) {
                        context.report(resource, message, {
                            codeLanguage,
                            codeSnippet,
                            element,
                            severity
                        });
                    }
                }
                parsedSetCookie.resource = resource;
                const messages = defaultValidators.reduce((messages, defaultValidator) => {
                    return messages.concat(defaultValidator(parsedSetCookie));
                }, []);
                reportBatch(messages, codeLanguage, codeSnippet);
            }
        };
        loadHintConfigs();
        context.on('fetch::end::*', validate);
    }
}
exports.default = ValidateSetCookieHeaderHint;
ValidateSetCookieHeaderHint.meta = meta_1.default;
