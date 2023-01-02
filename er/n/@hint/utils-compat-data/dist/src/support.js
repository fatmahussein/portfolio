"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupported = exports.getSupported = exports.getUnsupported = exports.getUnsupportedDetails = exports.getFriendlyName = void 0;
const css_1 = require("./css");
const html_1 = require("./html");
var browsers_1 = require("./browsers");
Object.defineProperty(exports, "getFriendlyName", { enumerable: true, get: function () { return browsers_1.getFriendlyName; } });
const getUnsupportedDetails = (feature, browsers) => {
    if ('attribute' in feature) {
        return (0, html_1.getAttributeUnsupported)(feature, browsers);
    }
    else if ('element' in feature) {
        return (0, html_1.getElementUnsupported)(feature, browsers);
    }
    else if ('property' in feature) {
        return (0, css_1.getDeclarationUnsupported)(feature, browsers);
    }
    else if ('rule' in feature) {
        return (0, css_1.getRuleUnsupported)(feature, browsers);
    }
    return (0, css_1.getSelectorUnsupported)(feature, browsers);
};
exports.getUnsupportedDetails = getUnsupportedDetails;
const getUnsupported = (feature, browsers) => {
    const data = (0, exports.getUnsupportedDetails)(feature, browsers);
    return data && data.browsers;
};
exports.getUnsupported = getUnsupported;
const getSupported = (feature, browsers) => {
    const unsupported = (0, exports.getUnsupported)(feature, browsers);
    if (!unsupported) {
        return browsers;
    }
    const supported = browsers.filter((browser) => {
        return !unsupported.includes(browser);
    });
    return supported.length ? supported : null;
};
exports.getSupported = getSupported;
const isSupported = (feature, browsers) => {
    return !(0, exports.getUnsupported)(feature, browsers);
};
exports.isSupported = isSupported;
