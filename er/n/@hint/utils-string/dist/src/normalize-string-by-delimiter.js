"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeStringByDelimiter = void 0;
const normalize_string_1 = require("./normalize-string");
const normalizeStringByDelimiter = (value, delimiter) => {
    return (0, normalize_string_1.normalizeString)(value).replace(/[^a-z0-9]/gi, delimiter);
};
exports.normalizeStringByDelimiter = normalizeStringByDelimiter;
