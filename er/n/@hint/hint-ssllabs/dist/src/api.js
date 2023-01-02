"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyze = void 0;
const got_1 = require("got");
const utils_1 = require("@hint/utils");
const APIURL = 'https://api.ssllabs.com/api/v3/analyze';
const analyzeWithRetry = async (options) => {
    const result = await (0, got_1.default)(APIURL, { searchParams: options }).json();
    if (result.status === 'READY' || result.status === 'ERROR') {
        return result;
    }
    await (0, utils_1.delay)(1000);
    return analyzeWithRetry(options);
};
const analyze = async (options) => {
    const result = await analyzeWithRetry(options);
    if (result.status === 'ERROR') {
        throw new Error(`Error analyzing url ${options.host}`);
    }
    return result;
};
exports.analyze = analyze;
