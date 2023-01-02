"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const config_checker_1 = require("./helpers/config-checker");
const strict_1 = require("./meta/strict");
class TypeScriptConfigStrict {
    constructor(context) {
        const validate = (0, config_checker_1.configChecker)('compilerOptions.strict', true, 'strict', context, utils_types_1.Severity.error);
        context.on('parse::end::typescript-config', validate);
    }
}
exports.default = TypeScriptConfigStrict;
TypeScriptConfigStrict.meta = strict_1.default;
