"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const no_devtool_in_prod_1 = require("./meta/no-devtool-in-prod");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class WebpackConfigNoDevtoolInProd {
    constructor(context) {
        const configReceived = (webpackConfigEvent) => {
            const { config, resource } = webpackConfigEvent;
            debug(`'parse::end::webpack-config' received`);
            if (config.devtool && config.devtool.toString().includes('eval')) {
                context.report(resource, (0, i18n_import_1.getMessage)('noEval', context.language, config.devtool.toString()), { severity: utils_types_1.Severity.warning });
            }
        };
        context.on('parse::end::webpack-config', configReceived);
    }
}
exports.default = WebpackConfigNoDevtoolInProd;
WebpackConfigNoDevtoolInProd.meta = no_devtool_in_prod_1.default;
