"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterSupports = void 0;
const difference = require("lodash/difference");
const intersection = require("lodash/intersection");
const union = require("lodash/union");
const utils_compat_data_1 = require("@hint/utils-compat-data");
const parse_supports_1 = require("./parse-supports");
class InvalidInputError extends Error {
    constructor(message) {
        super(message);
    }
}
const filterItem = (item, browsers) => {
    if ('prop' in item) {
        const supportsProperty = (0, utils_compat_data_1.getSupported)({ property: item.prop }, browsers);
        const supportsValue = supportsProperty && (0, utils_compat_data_1.getSupported)({ property: item.prop, value: item.value }, supportsProperty);
        return supportsValue || [];
    }
    switch (item.type) {
        case 'and':
            return intersection(...item.nodes.map((child) => {
                return filterItem(child, browsers);
            }));
        case 'or':
            return union(...item.nodes.map((child) => {
                return filterItem(child, browsers);
            }));
        case 'not':
            return difference(browsers, filterItem(item.nodes[0], browsers));
        default:
            throw new InvalidInputError('Unrecognized group type');
    }
};
const filterSupports = (params, browsers) => {
    const hasAtSupports = (0, utils_compat_data_1.getSupported)({ rule: 'supports' }, browsers);
    if (!hasAtSupports) {
        return null;
    }
    const root = (0, parse_supports_1.parseSupports)(params);
    if (!root) {
        return null;
    }
    try {
        const supported = filterItem(root, hasAtSupports);
        return supported.length ? supported : null;
    }
    catch (e) {
        if (e instanceof InvalidInputError) {
            return null;
        }
        throw e;
    }
};
exports.filterSupports = filterSupports;
