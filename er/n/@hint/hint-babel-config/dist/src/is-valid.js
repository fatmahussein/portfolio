"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const is_valid_1 = require("./meta/is-valid");
const debug = (0, utils_debug_1.debug)(__filename);
class BabelConfigIsValidHint {
    constructor(context) {
        const invalidJSONFile = (babelConfigInvalid, event) => {
            const { error, resource } = babelConfigInvalid;
            debug(`${event} received`);
            context.report(resource, error.message, { severity: utils_types_1.Severity.error });
        };
        const invalidExtends = (babelConfigInvalid, event) => {
            const { error, resource, getLocation } = babelConfigInvalid;
            debug(`${event} received`);
            context.report(resource, error.message, {
                location: getLocation('extends', { at: 'value' }),
                severity: utils_types_1.Severity.error
            });
        };
        const invalidSchema = (fetchEnd) => {
            const { groupedErrors, resource } = fetchEnd;
            debug(`'parse::error::babel-config::schema' received`);
            for (let i = 0; i < groupedErrors.length; i++) {
                const groupedError = groupedErrors[i];
                context.report(resource, groupedError.message, {
                    location: groupedError.location,
                    severity: utils_types_1.Severity.error
                });
            }
        };
        context.on('parse::error::babel-config::json', invalidJSONFile);
        context.on('parse::error::babel-config::extends', invalidExtends);
        context.on('parse::error::babel-config::schema', invalidSchema);
    }
}
exports.default = BabelConfigIsValidHint;
BabelConfigIsValidHint.meta = is_valid_1.default;
