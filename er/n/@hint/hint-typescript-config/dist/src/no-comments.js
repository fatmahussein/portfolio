"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const config_checker_1 = require("./helpers/config-checker");
const no_comments_1 = require("./meta/no-comments");
class TypeScriptConfigNoComments {
    constructor(context) {
        const validate = (0, config_checker_1.configChecker)('compilerOptions.removeComments', true, 'removeComments', context, utils_types_1.Severity.warning);
        context.on('parse::end::typescript-config', validate);
    }
}
exports.default = TypeScriptConfigNoComments;
TypeScriptConfigNoComments.meta = no_comments_1.default;
