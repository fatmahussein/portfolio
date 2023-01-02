"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElementUnsupported = exports.getAttributeUnsupported = void 0;
const browser_compat_data_1 = require("./browser-compat-data");
const browsers_1 = require("./browsers");
const cache_1 = require("./cache");
const helpers_1 = require("./helpers");
const getAttributeUnsupported = (feature, browsers) => {
    const key = `html-attribute:${feature.element || ''}|${feature.attribute}|${feature.value || ''}`;
    return (0, cache_1.getCachedValue)(key, browsers, () => {
        let data;
        let parentData;
        let prefix = '';
        let unprefixed = '';
        if (feature.element) {
            [parentData] = (0, helpers_1.getFeatureData)(browser_compat_data_1.mdn.html.elements, feature.element);
            [data, prefix, unprefixed] = (0, helpers_1.getFeatureData)(parentData, feature.attribute);
        }
        if (!data) {
            [data, prefix, unprefixed] = (0, helpers_1.getFeatureData)(browser_compat_data_1.mdn.html.global_attributes, feature.attribute);
        }
        if (feature.value) {
            [data, prefix, unprefixed] = (0, helpers_1.getFeatureData)(data, feature.value);
            if (!data && feature.element === 'input' && feature.attribute === 'type') {
                [data, prefix, unprefixed] = (0, helpers_1.getFeatureData)(browser_compat_data_1.mdn.html.elements.input, `input-${feature.value}`);
            }
        }
        return (0, browsers_1.getUnsupportedBrowsers)(data, prefix, browsers, unprefixed, parentData);
    });
};
exports.getAttributeUnsupported = getAttributeUnsupported;
const getElementUnsupported = (feature, browsers) => {
    return (0, cache_1.getCachedValue)(`html-element:${feature.element}`, browsers, () => {
        const [data, prefix, unprefixed] = (0, helpers_1.getFeatureData)(browser_compat_data_1.mdn.html.elements, feature.element);
        return (0, browsers_1.getUnsupportedBrowsers)(data, prefix, browsers, unprefixed);
    });
};
exports.getElementUnsupported = getElementUnsupported;
