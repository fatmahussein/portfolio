"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncTry = void 0;
const utils_debug_1 = require("@hint/utils-debug");
const debug = (0, utils_debug_1.debug)(__filename);
const asyncTry = (asyncFn) => {
    return async (...args) => {
        try {
            return await asyncFn(...args);
        }
        catch (err) {
            debug(err);
            return null;
        }
    };
};
exports.asyncTry = asyncTry;
