"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asPathString = void 0;
const os_1 = require("os");
const asPathString = (uri) => {
    if (uri.protocol !== 'file:') {
        return uri.pathname;
    }
    const pathname = (0, os_1.platform)() === 'win32' ?
        uri.pathname.substr(1) :
        uri.pathname;
    return decodeURI(pathname);
};
exports.asPathString = asPathString;
