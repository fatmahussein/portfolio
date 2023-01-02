"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_network_1 = require("@hint/utils-network");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const utils_types_1 = require("@hint/utils-types");
const debug = (0, utils_debug_1.debug)(__filename);
class HttpCacheHint {
    constructor(context) {
        const immutableEdgeVersions = [
            'edge 15',
            'edge 16',
            'edge 17',
            'edge 18'
        ];
        const immutableSupported = context.targetedBrowsers.some((browser) => {
            if (immutableEdgeVersions.includes(browser)) {
                return true;
            }
            if (browser.startsWith('firefox') || browser.includes('safari')) {
                return true;
            }
            return false;
        });
        const maxAgeTarget = context.hintOptions && context.hintOptions.maxAgeTarget || 180;
        const maxAgeResource = context.hintOptions && context.hintOptions.maxAgeResource || 31536000;
        const longCached = [
            'application/manifest+json',
            'audio/ogg',
            'audio/mpeg',
            'audio/mp4',
            'font/collection',
            'application/vnd.ms-fontobject',
            'font/opentype',
            'font/otf',
            'font/ttf',
            'font/woff',
            'font/woff2',
            'image/bmp',
            'image/gif',
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'image/webp',
            'image/x-icon',
            'text/css',
            'text/javascript',
            'video/mp4',
            'video/ogg',
            'video/webm'
        ];
        const predefinedRevvingPatterns = [
            /\/[^/]+[._-]v?\d+(\.\d+(\.\d+)?)?[^/]*\.\w+$/i,
            /\/v?\d+\.\d+\.\d+.*?\//i,
            /\/v\d.*?\//i,
            /\/([^/]+[._-])?([0-9a-f]{5,})([._-].*?)?\.\w+$/i
        ];
        let cacheRevvingPatterns = [];
        const parseCacheControlHeader = (cacheControlHeader) => {
            const directives = ['must-revalidate', 'no-cache', 'no-store', 'no-transform', 'public', 'private', 'proxy-revalidate'];
            const valueDirectives = ['max-age', 's-maxage'];
            const extensionDirectives = ['immutable', 'stale-while-revalidate', 'stale-if-error'];
            const usedDirectives = cacheControlHeader.split(',').map((value) => {
                return value.trim();
            });
            const parsedCacheControlHeader = usedDirectives.reduce((parsed, current) => {
                const [directive, value] = current.split('=');
                if (!directive) {
                    return parsed;
                }
                if (directive && value) {
                    if (!valueDirectives.includes(directive)) {
                        parsed.invalidValues.set(directive, value);
                        return parsed;
                    }
                    const seconds = parseFloat(value);
                    if (!value || isNaN(seconds) || !Number.isInteger(seconds) || seconds < 0) {
                        parsed.invalidValues.set(directive, value);
                        return parsed;
                    }
                    parsed.usedDirectives.set(directive, seconds);
                    return parsed;
                }
                if (directives.includes(directive) || extensionDirectives.includes(directive)) {
                    parsed.usedDirectives.set(directive, null);
                }
                else {
                    parsed.invalidDirectives.set(directive, null);
                }
                return parsed;
            }, {
                header: cacheControlHeader,
                invalidDirectives: new Map(),
                invalidValues: new Map(),
                usedDirectives: new Map()
            });
            return parsedCacheControlHeader;
        };
        const directivesToString = (directives) => {
            let str = '';
            directives.forEach((val, key) => {
                if (str.length > 0) {
                    str += ', ';
                }
                str += `'${key}${val ? `=${val}` : ''}'`;
            });
            return str;
        };
        const joinAndQuote = (strings) => {
            return strings.map((string) => {
                return `'${string}'`;
            }).join(', ');
        };
        const compareToMaxAge = (directives, threshold) => {
            const maxAge = directives.get('max-age');
            const sMaxAge = directives.get('s-maxage');
            if (maxAge) {
                return maxAge === threshold ? 0 : maxAge - threshold;
            }
            if (sMaxAge) {
                return sMaxAge === threshold ? 0 : sMaxAge - threshold;
            }
            return -1;
        };
        const nonRecommendedDirectives = (directives) => {
            const noDirectives = ['must-revalidate', 'no-store'];
            return noDirectives.filter((noDirective) => {
                return directives.has(noDirective);
            });
        };
        const hasCacheControl = (directives, fetchEnd) => {
            const { resource, response: { headers } } = fetchEnd;
            const cacheControl = headers && headers['cache-control'] || null;
            if (!cacheControl) {
                context.report(resource, (0, i18n_import_1.getMessage)('noHeaderFound', context.language), { severity: utils_types_1.Severity.error });
                return false;
            }
            return true;
        };
        const hasInvalidDirectives = (directives, fetchEnd) => {
            const { header, invalidDirectives, invalidValues } = directives;
            const { resource } = fetchEnd;
            const codeSnippet = `Cache-Control: ${header}`;
            const codeLanguage = 'http';
            if (invalidDirectives.size > 0) {
                const message = (0, i18n_import_1.getMessage)('directiveInvalid', context.language, joinAndQuote(Array.from(invalidDirectives.keys())));
                context.report(resource, message, { codeLanguage, codeSnippet, severity: utils_types_1.Severity.error });
                return false;
            }
            if (invalidValues.size > 0) {
                const message = (0, i18n_import_1.getMessage)('directiveInvalidValue', context.language, directivesToString(invalidValues));
                context.report(resource, message, { codeLanguage, codeSnippet, severity: utils_types_1.Severity.error });
                return false;
            }
            return true;
        };
        const hasNoneNonRecommendedDirectives = (directives, fetchEnd) => {
            const { header, usedDirectives } = directives;
            const { resource } = fetchEnd;
            const flaggedDirectives = nonRecommendedDirectives(usedDirectives);
            if (flaggedDirectives.length) {
                const message = (0, i18n_import_1.getMessage)('directiveNotRecomended', context.language, joinAndQuote(flaggedDirectives));
                context.report(resource, message, {
                    codeLanguage: 'http',
                    codeSnippet: `Cache-Control: ${header}`,
                    severity: utils_types_1.Severity.warning
                });
                return false;
            }
            return true;
        };
        const validateDirectiveCombinations = (directives, fetchEnd) => {
            const { header, usedDirectives } = directives;
            if (usedDirectives.has('no-cache') || usedDirectives.has('no-store')) {
                const hasMaxAge = (usedDirectives.has('max-age') || usedDirectives.has('s-maxage'));
                if (hasMaxAge) {
                    const message = (0, i18n_import_1.getMessage)('wrongCombination', context.language);
                    context.report(fetchEnd.resource, message, {
                        codeLanguage: 'http',
                        codeSnippet: `Cache-Control: ${header}`,
                        severity: utils_types_1.Severity.error
                    });
                    return false;
                }
            }
            return true;
        };
        const hasSmallCache = (directives, fetchEnd) => {
            const { header, usedDirectives } = directives;
            if (usedDirectives.has('no-cache')) {
                return true;
            }
            const isValidCache = compareToMaxAge(usedDirectives, maxAgeTarget) <= 0;
            if (!isValidCache) {
                const message = (0, i18n_import_1.getMessage)('targetShouldNotBeCached', context.language, `${maxAgeTarget}`);
                context.report(fetchEnd.resource, message, {
                    codeLanguage: 'http',
                    codeSnippet: `Cache-Control: ${header}`,
                    severity: utils_types_1.Severity.warning
                });
                return false;
            }
            return true;
        };
        const usesFileRevving = (directives, fetchEnd) => {
            const { element, resource } = fetchEnd;
            const matches = cacheRevvingPatterns.find((pattern) => {
                return !!resource.match(pattern);
            });
            if (!matches) {
                const message = (0, i18n_import_1.getMessage)('noCacheBustingPattern', context.language);
                context.report(resource, message, { element, severity: utils_types_1.Severity.warning });
                return false;
            }
            return true;
        };
        const hasLongCache = (directives, fetchEnd) => {
            const { header, usedDirectives } = directives;
            const { resource } = fetchEnd;
            const codeSnippet = `Cache-Control: ${header}`;
            const codeLanguage = 'http';
            const longCache = compareToMaxAge(usedDirectives, maxAgeResource) >= 0;
            const immutable = usedDirectives.has('immutable');
            const isCacheBusted = usesFileRevving(directives, fetchEnd);
            let validates = true;
            if (usedDirectives.has('no-cache') || !longCache) {
                const message = (0, i18n_import_1.getMessage)('staticResourceCacheValue', context.language, `${maxAgeResource}`);
                const severity = isCacheBusted ? utils_types_1.Severity.warning : utils_types_1.Severity.hint;
                context.report(resource, message, { codeLanguage, codeSnippet, severity });
                validates = false;
            }
            if (!immutable) {
                const message = (0, i18n_import_1.getMessage)('staticNotImmutable', context.language);
                const severity = immutableSupported && isCacheBusted ? utils_types_1.Severity.warning : utils_types_1.Severity.hint;
                context.report(resource, message, { codeLanguage, codeSnippet, severity });
                validates = false;
            }
            return validates;
        };
        const validate = (fetchEnd, eventName) => {
            const type = eventName === 'fetch::end::html' ? 'html' : 'fetch';
            const { resource } = fetchEnd;
            if ((0, utils_network_1.isDataURI)(resource)) {
                debug(`Check does not apply for data URIs`);
                return;
            }
            const headers = fetchEnd.response.headers;
            const { response: { mediaType } } = fetchEnd;
            const cacheControlHeaderValue = (0, utils_network_1.normalizeHeaderValue)(headers, 'cache-control', '');
            const parsedDirectives = parseCacheControlHeader(cacheControlHeaderValue);
            const validators = [
                hasCacheControl,
                hasInvalidDirectives,
                hasNoneNonRecommendedDirectives,
                validateDirectiveCombinations
            ];
            if (type === 'html') {
                validators.push(hasSmallCache);
            }
            else if (type === 'fetch' && longCached.includes(mediaType)) {
                let customRegex = context.hintOptions && context.hintOptions.revvingPatterns || null;
                if (customRegex) {
                    customRegex = customRegex.map((reg) => {
                        return new RegExp(reg, 'i');
                    });
                }
                cacheRevvingPatterns = customRegex || predefinedRevvingPatterns;
                validators.push(hasLongCache);
            }
            validators.every((validator) => {
                return validator(parsedDirectives, fetchEnd);
            });
            return;
        };
        context.on('fetch::end::*', validate);
    }
}
exports.default = HttpCacheHint;
HttpCacheHint.meta = meta_1.default;
