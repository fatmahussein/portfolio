"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includedHeaders = void 0;
const utils_string_1 = require("@hint/utils-string");
const includedHeaders = (headers, headerList = []) => {
    const result = [];
    const list = (0, utils_string_1.toLowerCaseArray)(headerList);
    for (const key of Object.keys(headers)) {
        const lowercaseKey = key.toLowerCase();
        if (list.includes(lowercaseKey)) {
            result.push(lowercaseKey);
        }
    }
    const shortedResult = result.sort();
    return shortedResult;
};
exports.includedHeaders = includedHeaders;
