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
        name: 'Invalid JSON should fail',
        path: path.join(__dirname, 'fixtures', 'invalidjson'),
        reports: [
            {
                message: `Unexpected token i in JSON at position 0`,
                position: { column: -1, line: -1 },
                severity: utils_types_1.Severity.error
            }
        ]
    },
    {
        name: 'Invalid schema should fail',
        path: path.join(__dirname, 'fixtures', 'invalidschemaenum'),
        reports: [
            {
                message: /^'compilerOptions\/lib\/3' must be equal to one of the allowed values .+Value found 'invalidlib'$/,
                position: { match: '"invalidlib"' },
                severity: utils_types_1.Severity.error
            }
        ]
    },
    {
        name: 'If schema has an invalid pattern, it should fail',
        path: path.join(__dirname, 'fixtures', 'invalidschemapattern'),
        reports: [
            {
                message: /^'compilerOptions\/target' must be equal to one of the allowed values .+Value found 'invalid'$/,
                position: { match: 'target' },
                severity: utils_types_1.Severity.error
            }
        ]
    },
    {
        name: 'If the configuration has a circular reference, it should fail',
        path: path.join(__dirname, 'fixtures', 'circular'),
        reports: [
            {
                message: `Circular reference found in file ${path.join(__dirname, 'fixtures', 'circular-2', 'tsconfig.circular.json')}`,
                position: { match: '"../circular-2/tsconfig.circular.json"' },
                severity: utils_types_1.Severity.error
            }
        ]
    },
    {
        name: 'If the configuration has an invalid extends, it should fail',
        path: path.join(__dirname, 'fixtures', 'invalid-extends'),
        reports: [
            {
                message: `Unexpected token i in JSON at position 0`,
                position: { match: '"../invalidjson/tsconfig.json"' },
                severity: utils_types_1.Severity.error
            }
        ]
    }
];
(0, utils_tests_helpers_1.testLocalHint)(hintPath, tests, { parsers: ['typescript-config'] });
