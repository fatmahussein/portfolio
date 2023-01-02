"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_types_1 = require("@hint/utils-types");
const utils_debug_1 = require("@hint/utils-debug");
const utils_1 = require("@hint/utils");
const config_checker_1 = require("./helpers/config-checker");
const import_helpers_1 = require("./meta/import-helpers");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class TypeScriptConfigImportHelpers {
    constructor(context) {
        const validate = (0, config_checker_1.configChecker)('compilerOptions.importHelpers', true, 'importHelpers', context, utils_types_1.Severity.warning);
        const validateTslibInstalled = (evt) => {
            const { resource } = evt;
            try {
                const pathToTslib = path.dirname(require.resolve('tslib', { paths: [resource] }));
                debug(`Searching "tslib" relative to ${resource}`);
                (0, utils_1.loadPackage)(pathToTslib);
                debug(`"tslib" found`);
            }
            catch (e) {
                debug(e);
                context.report(resource, (0, i18n_import_1.getMessage)('couldNotFindTSLib', context.language), { severity: utils_types_1.Severity.error });
            }
        };
        context.on('parse::end::typescript-config', validate);
        context.on('parse::end::typescript-config', validateTslibInstalled);
    }
}
exports.default = TypeScriptConfigImportHelpers;
TypeScriptConfigImportHelpers.meta = import_helpers_1.default;
