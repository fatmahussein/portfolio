"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_tests_helpers_1 = require("@hint/utils-tests-helpers");
const utils_types_1 = require("@hint/utils-types");
const common = require("./_common");
const hintPath = (0, utils_tests_helpers_1.getHintPath)(__filename);
const noHttpServerTests = [{
        name: `strict-transport-security header sent over HTTP`,
        reports: [{
                message: `The 'strict-transport-security' header should't be specified in pages served over HTTP.`,
                severity: utils_types_1.Severity.warning
            }],
        serverConfig: Object.assign({ '/': { headers: common.maxAgeOnlyHeader } })
    },
    {
        name: `strict-transport-security header not sent over HTTP`,
        serverConfig: { '/': '' }
    }];
(0, utils_tests_helpers_1.testHint)(hintPath, noHttpServerTests);
