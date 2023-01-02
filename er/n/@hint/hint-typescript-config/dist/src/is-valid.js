"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const is_valid_1 = require("./meta/is-valid");
const debug = (0, utils_debug_1.debug)(__filename);
class TypeScriptConfigIsValid {
    constructor(context) {
        const invalidJSONFile = (typeScriptConfigInvalid, event) => {
            const { error, resource } = typeScriptConfigInvalid;
            debug(`${event} received`);
            context.report(resource, error.message, { severity: utils_types_1.Severity.error });
        };
        const invalidExtends = (typeScriptConfigInvalid, event) => {
            const { error, resource, getLocation } = typeScriptConfigInvalid;
            debug(`${event} received`);
            context.report(resource, error.message, {
                location: getLocation('extends', { at: 'value' }),
                severity: utils_types_1.Severity.error
            });
        };
        const invalidSchema = (fetchEnd) => {
            const { groupedErrors, resource } = fetchEnd;
            debug(`'parse::error::typescript-config::schema' received`);
            groupedErrors.forEach((groupedError) => {
                context.report(resource, groupedError.message, {
                    location: groupedError.location,
                    severity: utils_types_1.Severity.error
                });
            });
        };
        context.on('parse::error::typescript-config::json', invalidJSONFile);
        context.on('parse::error::typescript-config::extends', invalidExtends);
        context.on('parse::error::typescript-config::schema', invalidSchema);
    }
}
exports.default = TypeScriptConfigIsValid;
TypeScriptConfigIsValid.meta = is_valid_1.default;
