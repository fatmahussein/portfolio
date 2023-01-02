"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompiledSelector = void 0;
const css_select_1 = require("css-select");
const CACHED_CSS_SELECTORS = new Map();
const getCompiledSelector = (selector) => {
    if (!CACHED_CSS_SELECTORS.has(selector)) {
        CACHED_CSS_SELECTORS.set(selector, (0, css_select_1.compile)(selector));
    }
    return CACHED_CSS_SELECTORS.get(selector);
};
exports.getCompiledSelector = getCompiledSelector;
