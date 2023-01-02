"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = void 0;
const utils_1 = require("@hint/utils");
const utils_debug_1 = require("@hint/utils-debug");
const utils_json_1 = require("@hint/utils-json");
const debug = (0, utils_debug_1.debug)(__filename);
const schema = require('./config-schema.json');
const validateConfig = (config) => {
    debug('Validating configuration');
    const validateInfo = (0, utils_json_1.validate)(schema, config);
    if (!validateInfo.valid) {
        utils_1.logger.error('Configuration schema is not valid:');
        validateInfo.groupedErrors.forEach((error) => {
            utils_1.logger.error(` - ${error.message}`);
        });
        return false;
    }
    return true;
};
exports.validateConfig = validateConfig;
