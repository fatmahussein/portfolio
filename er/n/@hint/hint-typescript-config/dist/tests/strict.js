"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_tests_helpers_1 = require("@hint/utils-tests-helpers");
const utils_types_1 = require("@hint/utils-types");
const hintPath = (0, utils_tests_helpers_1.getHintPath)(__filename, true);
const tests = [
    {
        name: 'Configuration with "compilerOptions.strict = true" should pass',
        path: path.join(__dirname, 'fixtures', 'strict', 'strict-true')
    },
    {
        name: 'Configuration with "compilerOptions.strict = false" should fail',
        path: path.join(__dirname, 'fixtures', 'strict', 'strict-false'),
        reports: [
            {
                message: 'The compiler option "strict" should be enabled to reduce type errors.',
                position: { match: 'false' },
                severity: utils_types_1.Severity.error
            }
        ]
    },
    {
        name: 'Configuration with no explicit "compilerOptions.strict" should fail',
        path: path.join(__dirname, 'fixtures', 'strict', 'no-strict'),
        reports: [
            {
                message: 'The compiler option "strict" should be enabled to reduce type errors.',
                position: { match: 'compilerOptions' },
                severity: utils_types_1.Severity.error
            }
        ]
    }
];
(0, utils_tests_helpers_1.testLocalHint)(hintPath, tests, { parsers: ['typescript-config'] });
