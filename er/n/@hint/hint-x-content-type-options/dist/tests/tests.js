"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const utils_create_server_1 = require("@hint/utils-create-server");
const utils_tests_helpers_1 = require("@hint/utils-tests-helpers");
const pageWithAlternateStylesheet = (0, utils_create_server_1.generateHTMLPage)('<link rel="  alternate stylesheet " href="test.css">');
const pageWithScript = (0, utils_create_server_1.generateHTMLPage)(undefined, '<script src="test.js"></script>');
const pageWithScriptAndStylesheet = (0, utils_create_server_1.generateHTMLPage)('<link rel="stylesheet" href="test.css">', '<script src="test.js"></script>');
const pageWithStylesheet = (0, utils_create_server_1.generateHTMLPage)('<link rel="stylesheet" href="test.css">');
const noHeaderErrorMessage = `Response should include 'x-content-type-options' header.`;
const invalidValueMessage = `The 'x-content-type-options' header value should be 'nosniff'.`;
const tests = [
    {
        name: `HTML page is served without 'X-Content-Type-Options' header`,
        reports: [{
                message: noHeaderErrorMessage,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: {
            '/': { content: (0, utils_create_server_1.generateHTMLPage)() },
            '/favicon.ico': { headers: { 'X-Content-Type-Options': 'nosniff' } }
        }
    },
    {
        name: `Favicon is served without 'X-Content-Type-Options' header`,
        reports: [{
                message: noHeaderErrorMessage,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: {
            '/': { content: (0, utils_create_server_1.generateHTMLPage)(), headers: { 'Content-Type': 'text/html', 'X-Content-Type-Options': 'nosniff' } },
            '/favicon.ico': ''
        }
    },
    {
        name: `Stylesheet is served without 'X-Content-Type-Options' header`,
        reports: [{
                message: noHeaderErrorMessage,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: {
            '/': { content: pageWithStylesheet, headers: { 'Content-Type': 'text/html', 'X-Content-Type-Options': 'nosniff' } },
            '/favicon.ico': { headers: { 'X-Content-Type-Options': 'nosniff' } },
            '/test.css': ''
        }
    },
    {
        name: `Alternate stylesheet is served without 'X-Content-Type-Options' header`,
        reports: [{
                message: noHeaderErrorMessage,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: {
            '/': { content: pageWithAlternateStylesheet, headers: { 'Content-Type': 'text/html', 'X-Content-Type-Options': 'nosniff' } },
            '/favicon.ico': { headers: { 'X-Content-Type-Options': 'nosniff' } },
            '/test.css': ''
        }
    },
    {
        name: `Resource is specified as a data URI`,
        serverConfig: {
            '/': {
                content: (0, utils_create_server_1.generateHTMLPage)(undefined, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==">'),
                headers: { 'X-Content-Type-Options': 'nosniff' }
            },
            '/favicon.ico': { headers: { 'X-Content-Type-Options': 'nosniff' } }
        }
    },
    {
        name: `Script is served with 'X-Content-Type-Options' header with invalid value`,
        reports: [{
                message: invalidValueMessage,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: {
            '/': { content: pageWithScript, headers: { 'Content-Type': 'text/html', 'X-Content-Type-Options': 'nosniff' } },
            '/favicon.ico': { headers: { 'X-Content-Type-Options': 'nosniff' } },
            '/test.js': { headers: { 'X-Content-Type-Options': 'invalid' } }
        }
    },
    {
        name: `All resources are served with 'X-Content-Type-Options' header`,
        serverConfig: { '*': { content: pageWithScriptAndStylesheet, headers: { 'Content-Type': 'text/html', 'X-Content-Type-Options': 'nosniff' } } }
    }
];
(0, utils_tests_helpers_1.testHint)((0, utils_tests_helpers_1.getHintPath)(__filename), tests);
