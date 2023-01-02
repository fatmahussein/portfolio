"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeEnvWithOptions = void 0;
const lodash_1 = require("lodash");
const isWebhintVariable = (variable) => {
    return variable.toLowerCase().startsWith('webhint_');
};
const parseValue = (value) => {
    const parsedInt = parseInt(value);
    if (!isNaN(parsedInt)) {
        return parsedInt;
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return value;
};
const addToConfig = (variable, value, config) => {
    const parts = variable.split('_');
    parts.shift();
    const lastPart = parts.pop();
    const context = parts.reduce((current, part) => {
        return (current[part] = current[part] || {});
    }, config);
    context[lastPart] = parseValue(value);
};
const mergeEnvWithOptions = (options) => {
    const environment = process.env;
    const envConfig = {};
    const variables = Object.keys(environment);
    for (const variable of variables) {
        if (isWebhintVariable(variable)) {
            addToConfig(variable, process.env[variable], envConfig);
        }
    }
    const finalOptions = (0, lodash_1.merge)(envConfig, options);
    return finalOptions;
};
exports.mergeEnvWithOptions = mergeEnvWithOptions;
