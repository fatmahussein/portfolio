"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const config_checker_1 = require("./helpers/config-checker");
const consistent_casing_1 = require("./meta/consistent-casing");
class TypeScriptConfigConsistentCasing {
    constructor(context) {
        const validate = (0, config_checker_1.configChecker)('compilerOptions.forceConsistentCasingInFileNames', true, 'forceConsistentCasingInFileNames', context, utils_types_1.Severity.warning);
        context.on('parse::end::typescript-config', validate);
    }
}
exports.default = TypeScriptConfigConsistentCasing;
TypeScriptConfigConsistentCasing.meta = consistent_casing_1.default;
