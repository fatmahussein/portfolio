"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAsUris = exports.getAsUri = void 0;
const path = require("path");
const url = require("url");
const url_1 = require("url");
const compact = require("lodash/compact");
const utils_debug_1 = require("@hint/utils-debug");
const utils_fs_1 = require("@hint/utils-fs");
const logger = require("@hint/utils/dist/src/logging");
const debug = (0, utils_debug_1.debug)(__filename);
const getAsUri = (source) => {
    let target;
    try {
        target = new url_1.URL(source);
    }
    catch (err) {
        {
            target = null;
        }
    }
    const protocol = target ? target.protocol : null;
    if (protocol === 'http:' || protocol === 'https:' || protocol === 'file:') {
        debug(`Adding valid target: ${target && url.format(target)}`);
        return target;
    }
    if ((0, utils_fs_1.isFile)(source) || (0, utils_fs_1.isDirectory)(source)) {
        target = new url_1.URL(`file://${path.resolve(source)}`);
        debug(`Adding valid target: ${url.format(target)}`);
        return target;
    }
    target = new url_1.URL(`http://${source}`);
    if (!(0, utils_fs_1.pathExists)(source) && (target.hostname === 'localhost' || target.hostname.includes('.'))) {
        debug(`Adding modified target: ${url.format(target)}`);
        return target;
    }
    logger.error(`Ignoring '${source}' as it's not an existing file nor a valid URL`);
    return null;
};
exports.getAsUri = getAsUri;
const getAsUris = (source) => {
    const targets = source.reduce((uris, entry) => {
        const uri = (0, exports.getAsUri)(entry);
        if (uri) {
            uris.push(uri);
        }
        return uris;
    }, []);
    return compact(targets);
};
exports.getAsUris = getAsUris;
