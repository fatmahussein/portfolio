"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findValue = exports.findLocation = exports.configChecker = void 0;
const i18n_import_1 = require("../i18n.import");
const findValue = (property, config) => {
    const properties = property.split('.');
    let current = config[properties.shift() || ''];
    while (properties.length > 0 && typeof current !== 'undefined') {
        current = current[properties.shift() || ''];
    }
    return current;
};
exports.findValue = findValue;
const findLocation = (propertyPath, mergedConfig, originalConfig, getLocation) => {
    const valueInOriginal = findValue(propertyPath, originalConfig);
    if (typeof valueInOriginal !== 'undefined') {
        return getLocation(propertyPath, { at: 'value' });
    }
    const valueInMerged = findValue(propertyPath, mergedConfig);
    if (typeof valueInMerged !== 'undefined') {
        return getLocation('extends', { at: 'value' });
    }
    const ancestors = propertyPath.split('.').slice(0, -1);
    while (ancestors.length > 0) {
        const ancestor = ancestors.pop();
        if (ancestor && ancestor in originalConfig) {
            return getLocation(ancestor);
        }
    }
    return null;
};
exports.findLocation = findLocation;
const configChecker = (property, desiredValue, messageName, context, severity) => {
    return (evt) => {
        const { config, getLocation, mergedConfig, originalConfig, resource } = evt;
        const current = findValue(property, config);
        if (current !== desiredValue) {
            const location = findLocation(property, mergedConfig, originalConfig, getLocation);
            const message = (0, i18n_import_1.getMessage)(messageName, context.language);
            context.report(resource, message, { location, severity });
        }
    };
};
exports.configChecker = configChecker;
