"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_tests_helpers_1 = require("@hint/utils-tests-helpers");
const utils_types_1 = require("@hint/utils-types");
const hintPath = (0, utils_tests_helpers_1.getHintPath)(__filename, true);
const tests = [
    {
        name: 'Valid configuration should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        name: `If there is no config file, it should pass`,
        path: path.join(__dirname, 'fixtures', 'noconfig')
    },
    {
        name: 'Invalid configuration should fail',
        path: path.join(__dirname, 'fixtures', 'invalidconfig'),
        reports: [{
                message: `Invalid or unexpected token`,
                severity: utils_types_1.Severity.error
            }]
    }
];
(0, utils_tests_helpers_1.testLocalHint)(hintPath, tests, { parsers: ['webpack-config'] });
