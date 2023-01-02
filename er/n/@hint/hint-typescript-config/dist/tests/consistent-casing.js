"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_tests_helpers_1 = require("@hint/utils-tests-helpers");
const utils_types_1 = require("@hint/utils-types");
const hintPath = (0, utils_tests_helpers_1.getHintPath)(__filename, true);
const tests = [
    {
        name: 'Configuration with "compilerOptions.forceConsistentCasingInFileNames = true" should pass',
        path: path.join(__dirname, 'fixtures', 'consistent-casing', 'valid')
    },
    {
        name: 'Configuration with "compilerOptions.forceConsistentCasingInFileNames = false" should fail',
        path: path.join(__dirname, 'fixtures', 'consistent-casing', 'consistent-casing-false'),
        reports: [
            {
                message: 'The compiler option "forceConsistentCasingInFileNames" should be enabled to reduce issues when working with different OSes.',
                position: { match: 'false' },
                severity: utils_types_1.Severity.warning
            }
        ]
    },
    {
        name: 'Configuration without "compilerOptions.forceConsistentCasingInFileNames" should fail',
        path: path.join(__dirname, 'fixtures', 'consistent-casing', 'no-consistent-casing'),
        reports: [{
                message: 'The compiler option "forceConsistentCasingInFileNames" should be enabled to reduce issues when working with different OSes.',
                position: { match: 'compilerOptions' },
                severity: utils_types_1.Severity.warning
            }]
    }
];
(0, utils_tests_helpers_1.testLocalHint)(hintPath, tests, { parsers: ['typescript-config'] });
