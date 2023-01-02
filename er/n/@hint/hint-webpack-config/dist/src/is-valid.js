"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const is_valid_1 = require("./meta/is-valid");
const debug = (0, utils_debug_1.debug)(__filename);
class WebpackConfigIsValid {
    constructor(context) {
        const invalidConfigurationFile = (webpackConfigInvalid) => {
            const { error, resource } = webpackConfigInvalid;
            debug(`'parse::error::webpack-config::configuration' received`);
            context.report(resource, error.message, { severity: utils_types_1.Severity.error });
        };
        context.on('parse::error::webpack-config::configuration', invalidConfigurationFile);
    }
}
exports.default = WebpackConfigIsValid;
WebpackConfigIsValid.meta = is_valid_1.default;
