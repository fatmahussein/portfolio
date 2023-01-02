"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRegularProtocol = void 0;
const utils_debug_1 = require("@hint/utils-debug");
const utils_string_1 = require("@hint/utils-string");
const debug = (0, utils_debug_1.debug)(__filename);
const protocolRegex = /([^:]*):.*/;
const isRegularProtocol = (uri) => {
    const normalizedUri = (0, utils_string_1.normalizeString)(uri);
    const exec = protocolRegex.exec(normalizedUri);
    const protocol = exec ? exec[1] : null;
    if (![null, 'http', 'https'].includes(protocol)) {
        debug(`Ignore protocol: ${protocol}`);
        return false;
    }
    return true;
};
exports.isRegularProtocol = isRegularProtocol;
