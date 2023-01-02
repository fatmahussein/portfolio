"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluateCustomResourceLoader = void 0;
const utils_connector_tools_1 = require("@hint/utils-connector-tools");
const jsdom_1 = require("jsdom");
const utils_debug_1 = require("@hint/utils-debug");
const debug = (0, utils_debug_1.debug)(__filename);
class EvaluateCustomResourceLoader extends jsdom_1.ResourceLoader {
    constructor(options, url) {
        super();
        this._requester = new utils_connector_tools_1.Requester(options);
        this._baseUrl = url;
    }
    fetch(url, options) {
        if (!url) {
            const promise = Promise.resolve(null);
            promise.abort = () => { };
            return promise;
        }
        const urlAsUrl = new URL(url);
        let resourceUrl = urlAsUrl.href;
        if (!urlAsUrl.protocol) {
            resourceUrl = new URL(resourceUrl, this._baseUrl).href;
        }
        let abort;
        const promise = new Promise(async (resolve, reject) => {
            abort = reject;
            try {
                const resourceNetworkData = await this._requester.get(resourceUrl);
                debug(`resource ${resourceUrl} fetched`);
                return resolve(resourceNetworkData.response.body.rawContent);
            }
            catch (err) {
                return reject(err);
            }
        });
        promise.abort = () => {
            const error = new Error('request canceled by user');
            abort(error);
        };
        return promise;
    }
}
exports.EvaluateCustomResourceLoader = EvaluateCustomResourceLoader;
