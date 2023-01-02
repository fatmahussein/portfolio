"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElementFromResponse = void 0;
const utils_dom_1 = require("@hint/utils-dom");
const getElementFromResponse = (source, dom) => {
    const request = 'request' in source ?
        source.request() :
        source;
    const redirectChain = request.redirectChain();
    const requestUrl = redirectChain && redirectChain.length > 0 ?
        redirectChain[0].url() :
        source.url();
    if (dom && requestUrl.startsWith('http')) {
        return (0, utils_dom_1.getElementByUrl)(dom, requestUrl);
    }
    return null;
};
exports.getElementFromResponse = getElementFromResponse;
