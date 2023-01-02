"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const is_installed_1 = require("./meta/is-installed");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class WebpackConfigIsInstalled {
    constructor(context) {
        const notInstall = () => {
            debug(`'parse::error::webpack-config::not-install' received`);
            context.report('', (0, i18n_import_1.getMessage)('isInstalled', context.language), { severity: utils_types_1.Severity.warning });
        };
        context.on('parse::error::webpack-config::not-install', notInstall);
    }
}
exports.default = WebpackConfigIsInstalled;
WebpackConfigIsInstalled.meta = is_installed_1.default;
