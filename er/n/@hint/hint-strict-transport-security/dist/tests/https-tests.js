"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_tests_helpers_1 = require("@hint/utils-tests-helpers");
const utils_types_1 = require("@hint/utils-types");
const common = require("./_common");
const hintPath = (0, utils_tests_helpers_1.getHintPath)(__filename);
const defaultTests = [
    {
        name: `HTML page is served over HTTPS without 'Strict-Transport-Security' header specified`,
        reports: [{
                message: common.noHeaderError,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: common.faviconHeaderMaxAgeOnly
    },
    {
        name: `Resource is served over HTTPS without 'Strict-Transport-Security' header specified`,
        reports: [{
                message: common.noHeaderError,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': common.htmlPageWithScriptData, '/test.js': '' })
    },
    {
        name: `HTML pages is served over HTTPS and 'max-age' defined is too short`,
        reports: [{
                message: common.tooShortErrorDefault,
                severity: utils_types_1.Severity.warning
            }],
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.tooShortHeader } })
    },
    {
        name: `Resource is served over HTTPS and 'max-age' defined is too short`,
        reports: [{
                message: common.tooShortErrorDefault,
                severity: utils_types_1.Severity.warning
            }],
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': common.htmlPageWithScriptData, '/test.js': { headers: common.tooShortHeader } })
    },
    {
        name: `'Strict-Transport-Security' header with 'max-age' bigger than minimum`,
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.maxAgeOnlyHeader } })
    },
    {
        name: `'Strict-Transport-Security' header contains 'includeSubDomains'`,
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.includeSubDomainsHeader } })
    },
    {
        name: `'Strict-Transport-Security' header contains 'preload'`,
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.preloadHeader } })
    },
    {
        name: `'Strict-Transport-Security' header has no 'max-age' directive`,
        reports: [{
                message: common.noMaxAgeError,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.noMaxAgeHeader } })
    },
    {
        name: `'Strict-Transport-Security' header has a 'max-age' directive in mix cases`,
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.mixCaseHeader } })
    },
    {
        name: `'Strict-Transport-Security' header has multiple 'max-age' directives`,
        reports: [{
                message: common.duplicateDirectivesError,
                severity: utils_types_1.Severity.warning
            }],
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.multipleMaxAgeHeader } })
    },
    {
        name: `'Strict-Transport-Security' header has multiple 'includeSubdomains' directives`,
        reports: [{
                message: common.duplicateDirectivesError,
                severity: utils_types_1.Severity.warning
            }],
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.multipleincludeSubDomainsHeader } })
    },
    {
        name: `'Strict-Transport-Security' header has the wrong delimiter`,
        reports: [{
                message: common.wrongFormatError,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.wrongDelimiterHeader } })
    },
    {
        name: `'Strict-Transport-Security' header that includes letters in the 'max-age' value`,
        reports: [{
                message: common.wrongFormatError,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.includeUnitMaxAgeHeader } })
    },
    {
        name: `'Strict-Transport-Security' header that wraps 'max-age' value in quotes`,
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.quotedStringHeader } })
    }
];
const configMaxAgeTests = [{
        name: `Change the minimum max-age value`,
        reports: [{
                message: common.generateTooShortError(common.OkayMaxAge + 1),
                severity: utils_types_1.Severity.warning
            }],
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.maxAgeOnlyHeader } })
    }];
const configPreloadTets = [
    {
        name: `The 'Strict-Transport-Security' header doesn't have 'preload' attribute`,
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.maxAgeOnlyHeader } })
    },
    {
        name: `The site is already on the preload list`,
        overrides: common.requestJSONAsyncMock({ status: common.preloaded }),
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.preloadHeader } })
    },
    {
        name: `The site is not on the preload list, and is qualified to be enrolled`,
        overrides: common.requestJSONAsyncMock({ preloadable: common.noErrors, status: common.unknown }),
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.preloadHeader } })
    },
    {
        name: `The site is not on the preload list, and it isn't qualified to be enrolled`,
        overrides: common.requestJSONAsyncMock({ preloadable: common.hasErrors, status: common.unknown }),
        reports: [{
                message: common.notPreloadableError,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.preloadHeader } })
    },
    {
        name: `Service error with the preload status endpoint`,
        overrides: common.requestJSONAsyncMock({ preloadable: common.hasErrors, status: null }),
        reports: [{
                message: common.statusServiceError,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.preloadHeader } })
    },
    {
        name: `Service error with the preload eligibility endpoint`,
        overrides: common.requestJSONAsyncMock({ preloadable: null, status: common.unknown }),
        reports: [{
                message: common.preloadableServiceError,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.preloadHeader } })
    },
    {
        name: `There's a problem with the verification endpoint`,
        overrides: common.requestJSONAsyncMock({ status: { status: null } }),
        reports: [{
                message: common.problemWithVerificationEndpoint,
                severity: utils_types_1.Severity.warning
            }],
        serverConfig: Object.assign(Object.assign({}, common.faviconHeaderMaxAgeOnly), { '/': { headers: common.preloadHeader } })
    }
];
(0, utils_tests_helpers_1.testHint)(hintPath, defaultTests, { https: true });
(0, utils_tests_helpers_1.testHint)(hintPath, configMaxAgeTests, {
    hintOptions: { minMaxAgeValue: common.OkayMaxAge + 1 },
    https: true
});
(0, utils_tests_helpers_1.testHint)(hintPath, configPreloadTets, {
    hintOptions: { checkPreload: true },
    https: true,
    serial: true
});
