"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeHeaderValue = void 0;
const utils_string_1 = require("@hint/utils-string");
const normalizeHeaderValue = (headers, headerName, defaultValue) => {
    return (0, utils_string_1.normalizeString)(headers && headers[(0, utils_string_1.normalizeString)(headerName) || ''], defaultValue);
};
exports.normalizeHeaderValue = normalizeHeaderValue;
