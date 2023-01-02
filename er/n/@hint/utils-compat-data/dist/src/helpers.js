"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeatureData = void 0;
const utils_css_1 = require("@hint/utils-css");
const getFeatureData = (context, name) => {
    if (!context || context[name]) {
        return [context && context[name], '', name];
    }
    const prefix = (0, utils_css_1.getVendorPrefix)(name);
    const unprefixedName = (0, utils_css_1.getUnprefixed)(name);
    return [context[unprefixedName], prefix, unprefixedName];
};
exports.getFeatureData = getFeatureData;
