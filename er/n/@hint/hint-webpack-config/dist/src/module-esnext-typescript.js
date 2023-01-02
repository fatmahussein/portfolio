"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const debug = (0, utils_debug_1.debug)(__filename);
const module_esnext_typescript_1 = require("./meta/module-esnext-typescript");
const i18n_import_1 = require("./i18n.import");
class WebpackConfigModuleESNextTypescript {
    constructor(context) {
        let webpackEvent;
        let typescriptEvent;
        const webpackConfigReceived = (webpackConfigEvent) => {
            debug(`'parse::end::webpack-config' received`);
            webpackEvent = webpackConfigEvent;
        };
        const typescriptConfigReceived = (typescriptConfigEvent) => {
            debug(`'parse::end::typescript-config' received`);
            typescriptEvent = typescriptConfigEvent;
        };
        const validate = () => {
            if (!webpackEvent) {
                debug(`no 'parse::end::webpack-config' received`);
                return;
            }
            if (!typescriptEvent) {
                debug(`no 'parse::end::typescript-config' received`);
                return;
            }
            const version = parseInt(webpackEvent.version);
            if (version < 2) {
                return;
            }
            if (typescriptEvent.config.compilerOptions && typescriptEvent.config.compilerOptions.module.toLowerCase() !== 'esnext') {
                context.report(typescriptEvent.resource, (0, i18n_import_1.getMessage)('esnext', context.language), { severity: utils_types_1.Severity.error });
            }
        };
        context.on('parse::end::webpack-config', webpackConfigReceived);
        context.on('parse::end::typescript-config', typescriptConfigReceived);
        context.on('scan::end', validate);
    }
}
exports.default = WebpackConfigModuleESNextTypescript;
WebpackConfigModuleESNextTypescript.meta = module_esnext_typescript_1.default;
