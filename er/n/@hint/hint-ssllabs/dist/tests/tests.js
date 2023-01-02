"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_tests_helpers_1 = require("@hint/utils-tests-helpers");
const utils_types_1 = require("@hint/utils-types");
const hintPath = (0, utils_tests_helpers_1.getHintPath)(__filename);
const ssllabsMock = (response) => {
    return {
        './api': {
            analyze: async (options) => {
                if (response === null) {
                    throw new Error('Error');
                }
                return response;
            }
        }
    };
};
const results = {
    aplussite: { endpoints: [{ grade: 'A+' }] },
    asite: {
        endpoints: [{ grade: 'A' }, {
                grade: 'A',
                serverName: 'a-site.net'
            }]
    },
    nohttps: { endpoints: [{ details: { protocols: [] } }] }
};
const testsForDefaults = [
    {
        name: `Site with with A+ grade passes`,
        overrides: ssllabsMock(results.aplussite),
        serverUrl: 'https://example.com'
    },
    {
        name: `Site A grade passes`,
        overrides: ssllabsMock(results.asite),
        serverUrl: 'https://example.com'
    },
    {
        name: `Domain without HTTPS fails with default configuration`,
        overrides: ssllabsMock(results.nohttps),
        reports: [{
                message: `'http://example.com/' does not support HTTPS.`,
                severity: utils_types_1.Severity.error
            }],
        serverUrl: 'http://example.com'
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    }
];
const testsForConfigs = [
    {
        name: `Site with A+ grade passes with A+ minimum`,
        overrides: ssllabsMock(results.aplussite),
        serverUrl: 'https://example.com'
    },
    {
        name: `Site with A grade doesn't pass with A+ minimum`,
        overrides: ssllabsMock(results.asite),
        reports: [
            {
                message: `https://example.com/'s grade A does not meet the minimum A+ required.`,
                severity: utils_types_1.Severity.error
            },
            {
                message: `a-site.net's grade A does not meet the minimum A+ required.`,
                severity: utils_types_1.Severity.error
            }
        ],
        serverUrl: 'https://example.com'
    },
    {
        name: `Domain without HTTPS fails with a custom configuration`,
        overrides: ssllabsMock(results.nohttps),
        reports: [{
                message: `'http://example.com/' does not support HTTPS.`,
                severity: utils_types_1.Severity.error
            }],
        serverUrl: 'http://example.com'
    }
];
const testsForErrors = [
    {
        name: 'Issue gettings results from SSL Labs reports error',
        overrides: ssllabsMock(null),
        reports: [{
                message: `Could not get results from SSL Labs for 'https://example.com/'.`,
                severity: utils_types_1.Severity.warning
            }],
        serverUrl: 'https://example.com'
    },
    {
        name: 'Missing endpoints reports an error',
        overrides: ssllabsMock({}),
        reports: [{
                message: `Didn't get any result for https://example.com/.
There might be something wrong with SSL Labs servers.`,
                severity: utils_types_1.Severity.warning
            }],
        serverUrl: 'https://example.com'
    },
    {
        name: 'Empty endpoints array reports an error',
        overrides: ssllabsMock({ endpoints: [] }),
        reports: [{
                message: `Didn't get any result for https://example.com/.
There might be something wrong with SSL Labs servers.`,
                severity: utils_types_1.Severity.warning
            }],
        serverUrl: 'https://example.com'
    },
    {
        name: 'Response with right status code but nothing inside reports an error',
        overrides: ssllabsMock(undefined),
        reports: [{
                message: `Didn't get any result for https://example.com/.
There might be something wrong with SSL Labs servers.`,
                severity: utils_types_1.Severity.warning
            }],
        serverUrl: 'https://example.com'
    }
];
(0, utils_tests_helpers_1.testHint)(hintPath, testsForDefaults, { serial: true });
(0, utils_tests_helpers_1.testHint)(hintPath, testsForConfigs, {
    hintOptions: { grade: 'A+' },
    serial: true
});
(0, utils_tests_helpers_1.testHint)(hintPath, testsForErrors, { serial: true });
