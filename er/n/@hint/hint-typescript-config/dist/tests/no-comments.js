"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_tests_helpers_1 = require("@hint/utils-tests-helpers");
const utils_types_1 = require("@hint/utils-types");
const hintPath = (0, utils_tests_helpers_1.getHintPath)(__filename, true);
const tests = [
    {
        name: 'Configuration with "compilerOptions.removeComments = true" should pass',
        path: path.join(__dirname, 'fixtures', 'no-comments', 'valid')
    },
    {
        name: 'Configuration with "compilerOptions.removeComments = false" should fail',
        path: path.join(__dirname, 'fixtures', 'no-comments', 'invalid'),
        reports: [{
                message: 'The compiler option "removeComments" should be enabled to reduce the output size.',
                severity: utils_types_1.Severity.warning
            }]
    },
    {
        name: 'Configuration with "compilerOptions.removeComments = false" in extends should fail',
        path: path.join(__dirname, 'fixtures', 'extends-with-error'),
        reports: [{
                message: 'The compiler option "removeComments" should be enabled to reduce the output size.',
                position: { match: '"../no-comments/invalid/tsconfig.json"' },
                severity: utils_types_1.Severity.warning
            }]
    },
    {
        name: 'Configuration without "compilerOptions" should fail',
        path: path.join(__dirname, 'fixtures', 'no-compiler-options'),
        reports: [{
                message: 'The compiler option "removeComments" should be enabled to reduce the output size.',
                position: { match: '"../no-comments/invalid/tsconfig.json"' },
                severity: utils_types_1.Severity.warning
            }]
    }
];
(0, utils_tests_helpers_1.testLocalHint)(hintPath, tests, { parsers: ['typescript-config'] });
