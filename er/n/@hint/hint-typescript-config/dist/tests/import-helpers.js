"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_tests_helpers_1 = require("@hint/utils-tests-helpers");
const utils_types_1 = require("@hint/utils-types");
const hintPath = (0, utils_tests_helpers_1.getHintPath)(__filename, true);
const tests = [
    {
        name: 'Configuration with "compilerOptions.importHelpers = true" should pass',
        overrides: {
            '@hint/utils': {
                loadPackage() {
                    return { exists: true };
                }
            }
        },
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import')
    },
    {
        name: 'Configuration with "compilerOptions.importHelpers = true" but tslibs is not installed should fail',
        overrides: {
            '@hint/utils': {
                loadPackage() {
                    throw new Error('Not found');
                }
            }
        },
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import'),
        reports: [{
                message: `Couldn't find package "tslib".`,
                severity: utils_types_1.Severity.error
            }]
    },
    {
        name: 'Configuration with "compilerOptions.importHelpers = false" should fail',
        overrides: {
            '@hint/utils': {
                loadPackage() {
                    return { exists: true };
                }
            }
        },
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import-false'),
        reports: [
            {
                message: 'The compiler option "importHelpers" should be enabled to reduce the output size.',
                position: { match: 'false' },
                severity: utils_types_1.Severity.warning
            }
        ]
    },
    {
        name: 'Configuration with no explicit "compilerOptions.importHelpers" should fail',
        overrides: {
            '@hint/utils': {
                loadPackage() {
                    return { exists: true };
                }
            }
        },
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'no-import'),
        reports: [
            {
                message: 'The compiler option "importHelpers" should be enabled to reduce the output size.',
                position: { match: 'compilerOptions' },
                severity: utils_types_1.Severity.warning
            }
        ]
    },
    {
        name: 'Configuration with no explicit "compilerOptions.importHelpers" and no "tslib" installed should fail',
        overrides: {
            '@hint/utils': {
                loadPackage() {
                    throw new Error('Not found');
                }
            }
        },
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'no-import'),
        reports: [
            {
                message: 'The compiler option "importHelpers" should be enabled to reduce the output size.',
                position: { match: 'compilerOptions' },
                severity: utils_types_1.Severity.warning
            },
            {
                message: `Couldn't find package "tslib".`,
                severity: utils_types_1.Severity.error
            }
        ]
    }
];
(0, utils_tests_helpers_1.testLocalHint)(hintPath, tests, { parsers: ['typescript-config'], serial: true });
