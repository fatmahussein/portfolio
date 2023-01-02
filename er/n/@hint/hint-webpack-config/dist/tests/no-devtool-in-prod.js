"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_tests_helpers_1 = require("@hint/utils-tests-helpers");
const utils_types_1 = require("@hint/utils-types");
const cwd = process.cwd();
const hintPath = (0, utils_tests_helpers_1.getHintPath)(__filename, true);
const tests = [
    {
        after() {
            process.chdir(cwd);
        },
        before() {
            process.chdir(path.join(__dirname, 'fixtures', 'valid'));
        },
        name: 'If no devtool in configuration, it should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        after() {
            process.chdir(cwd);
        },
        before() {
            process.chdir(path.join(__dirname, 'fixtures', 'valid'));
        },
        name: 'If devtool has a value different than `eval`, it should pass',
        path: path.join(__dirname, 'fixtures', 'noeval')
    },
    {
        after() {
            process.chdir(cwd);
        },
        before() {
            process.chdir(path.join(__dirname, 'fixtures', 'valid'));
        },
        name: 'If devtool is set to `eval` should fail',
        path: path.join(__dirname, 'fixtures', 'eval'),
        reports: [{
                message: '`eval` not recommended for prodution',
                severity: utils_types_1.Severity.warning
            }]
    }
];
(0, utils_tests_helpers_1.testLocalHint)(hintPath, tests, {
    parsers: ['webpack-config'],
    serial: true
});
