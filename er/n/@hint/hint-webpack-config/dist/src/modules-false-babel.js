"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const modules_false_babel_1 = require("./meta/modules-false-babel");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class WebpackConfigModulesFalseBabel {
    constructor(context) {
        let webpackEvent;
        let babelEvent;
        const webpackConfigReceived = (webpackConfigEvent) => {
            debug(`'parse::end::webpack-config' received`);
            webpackEvent = webpackConfigEvent;
        };
        const babelConfigReceived = (babelConfigEvent) => {
            debug(`'parse::end::babel-config' received`);
            babelEvent = babelConfigEvent;
        };
        const validate = () => {
            if (!webpackEvent) {
                debug(`no 'parse::end::webpack-config' received`);
                return;
            }
            if (!babelEvent) {
                debug(`no 'parse::end::babel-config' received`);
                return;
            }
            const version = parseInt(webpackEvent.version);
            const presets = babelEvent.config.presets;
            if (version < 2 || !presets || presets.length === 0) {
                return;
            }
            const modulesFalse = presets.filter((preset) => {
                return preset.length > 1 && preset[1].modules === false;
            });
            if (modulesFalse.length === 0) {
                context.report(babelEvent.resource, (0, i18n_import_1.getMessage)('babelModules', context.language), { severity: utils_types_1.Severity.error });
            }
        };
        context.on('parse::end::webpack-config', webpackConfigReceived);
        context.on('parse::end::babel-config', babelConfigReceived);
        context.on('scan::end', validate);
    }
}
exports.default = WebpackConfigModulesFalseBabel;
WebpackConfigModulesFalseBabel.meta = modules_false_babel_1.default;
