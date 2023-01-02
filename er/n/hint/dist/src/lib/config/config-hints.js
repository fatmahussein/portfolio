"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.getSeverity = void 0;
const utils_debug_1 = require("@hint/utils-debug");
const utils_json_1 = require("@hint/utils-json");
const utils_types_1 = require("@hint/utils-types");
const debug = (0, utils_debug_1.debug)(__filename);
const getSeverity = (config) => {
    let configuredSeverity = null;
    if (typeof config === 'string') {
        configuredSeverity = utils_types_1.Severity[config];
    }
    else if (typeof config === 'number') {
        configuredSeverity = config;
    }
    else if (Array.isArray(config)) {
        configuredSeverity = (0, exports.getSeverity)(config[0]);
    }
    if (configuredSeverity !== null && configuredSeverity >= 0 && configuredSeverity <= 5) {
        return configuredSeverity;
    }
    return null;
};
exports.getSeverity = getSeverity;
const validateHint = (schema, hintConfig) => {
    return (0, utils_json_1.validate)(schema, hintConfig).valid;
};
const validate = (meta, config, hintId) => {
    debug(`Validating hint ${hintId}`);
    if (!Array.isArray(config) && typeof config === 'object') {
        return false;
    }
    const configuredSeverity = (0, exports.getSeverity)(config);
    if (configuredSeverity === null) {
        throw new Error(`Invalid severity configured for ${hintId}`);
    }
    const schema = meta.schema;
    if (!Array.isArray(config) || (Array.isArray(schema) && schema.length === 0)) {
        return true;
    }
    if (Array.isArray(schema)) {
        if (config.length === 1) {
            return true;
        }
        return schema.some((sch) => {
            return validateHint(sch, config[1]);
        });
    }
    return validateHint(meta.schema, config[1]);
};
exports.validate = validate;
