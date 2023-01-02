"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const utils_create_server_1 = require("@hint/utils-create-server");
const utils_tests_helpers_1 = require("@hint/utils-tests-helpers");
const utils_types_1 = require("@hint/utils-types");
const generateScriptTag = (script) => {
    return `<script>${script}</script>`;
};
const hintPath = (0, utils_tests_helpers_1.getHintPath)(__filename);
const angular = fs.readFileSync(require.resolve('angular/angular.min.js'), 'utf-8');
const jquery = fs.readFileSync(require.resolve('jquery/dist/jquery.min.js'), 'utf-8');
const knockout = fs.readFileSync(require.resolve('knockout/dist/knockout.js'), 'utf-8');
const moment = fs.readFileSync(require.resolve('moment/moment.js'), 'utf-8');
const defaultTests = [
    {
        name: `page with no libraries passes the hint`,
        serverConfig: (0, utils_create_server_1.generateHTMLPage)()
    },
    {
        name: `page with a vulnerable library (jquery 2.1.4) fails`,
        reports: [{
                message: /^'jQuery@2\.1\.4'/,
                severity: utils_types_1.Severity.warning
            }],
        serverConfig: (0, utils_create_server_1.generateHTMLPage)(generateScriptTag(jquery))
    },
    {
        name: `page with a library with a tagged version and vulnerabilities (knockout 3.4.0-rc) fails`,
        reports: [{
                documentation: [{
                        link: 'https://snyk.io/vuln/npm:knockout:20180213',
                        text: 'Learn more about vulnerability npm:knockout:20180213 (medium) at Snyk'
                    }],
                message: /^'Knockout@3\.4\.0rc'/,
                severity: utils_types_1.Severity.warning
            }],
        serverConfig: (0, utils_create_server_1.generateHTMLPage)(generateScriptTag(knockout))
    },
    {
        name: `page with non vulnerable library (moment 2.22.2) passes`,
        serverConfig: (0, utils_create_server_1.generateHTMLPage)(generateScriptTag(moment))
    }
];
const userHighConfigTests = [
    {
        name: `page with a library with vulnerabilities medium or lower passes if configured severity is "high"`,
        serverConfig: (0, utils_create_server_1.generateHTMLPage)(generateScriptTag(jquery))
    },
    {
        name: `page with a library with vulnerabilities high fails if configured severity is "high"`,
        reports: [{
                documentation: [{
                        link: 'https://snyk.io/vuln/SNYK-JS-ANGULAR-572020',
                        text: 'Learn more about vulnerability SNYK-JS-ANGULAR-572020 (high) at Snyk'
                    }, {
                        link: 'https://snyk.io/vuln/SNYK-JS-ANGULAR-534884',
                        text: 'Learn more about vulnerability SNYK-JS-ANGULAR-534884 (high) at Snyk'
                    }, {
                        link: 'https://snyk.io/vuln/npm:angular:20150909',
                        text: 'Learn more about vulnerability npm:angular:20150909 (high) at Snyk'
                    }, {
                        link: 'https://snyk.io/vuln/npm:angular:20150807',
                        text: 'Learn more about vulnerability npm:angular:20150807 (high) at Snyk'
                    }],
                message: /^'AngularJS@1\.4\.9/,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: (0, utils_create_server_1.generateHTMLPage)(generateScriptTag(angular))
    }
];
const userMediumConfigTests = [
    {
        name: `page with a library with vulnerabilities medium fails if configured severity is "medium"`,
        reports: [{
                documentation: [{
                        link: 'https://snyk.io/vuln/SNYK-JS-JQUERY-567880',
                        text: 'Learn more about vulnerability SNYK-JS-JQUERY-567880 (medium) at Snyk'
                    }, {
                        link: 'https://snyk.io/vuln/SNYK-JS-JQUERY-565129',
                        text: 'Learn more about vulnerability SNYK-JS-JQUERY-565129 (medium) at Snyk'
                    }, {
                        link: 'https://snyk.io/vuln/SNYK-JS-JQUERY-174006',
                        text: 'Learn more about vulnerability SNYK-JS-JQUERY-174006 (medium) at Snyk'
                    }, {
                        link: 'https://snyk.io/vuln/npm:jquery:20150627',
                        text: 'Learn more about vulnerability npm:jquery:20150627 (medium) at Snyk'
                    }],
                message: /^'jQuery@2\.1\.4/,
                severity: utils_types_1.Severity.warning
            }],
        serverConfig: (0, utils_create_server_1.generateHTMLPage)(generateScriptTag(jquery))
    },
    {
        name: `page with a library with vulnerabilities high fails if configured severity is "medium"`,
        reports: [{
                message: /^'AngularJS@1\.4\.9/,
                severity: utils_types_1.Severity.error
            }],
        serverConfig: (0, utils_create_server_1.generateHTMLPage)(generateScriptTag(angular))
    }
];
(0, utils_tests_helpers_1.testHint)(hintPath, defaultTests);
(0, utils_tests_helpers_1.testHint)(hintPath, userHighConfigTests, { hintOptions: { severity: 'high' } });
(0, utils_tests_helpers_1.testHint)(hintPath, userMediumConfigTests, { hintOptions: { severity: 'medium' } });
