"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const utils_1 = require("@hint/utils");
const utils_dom_1 = require("@hint/utils-dom");
const utils_debug_1 = require("@hint/utils-debug");
const jsdom_1 = require("jsdom");
const debug = (0, utils_debug_1.debug)(__filename);
class CustomResourceLoader extends jsdom_1.ResourceLoader {
    constructor(connector, htmlDocument) {
        super();
        this._connector = connector;
        this._HTMLDocument = htmlDocument;
    }
    fetch(url, options) {
        if (!url) {
            const promise = Promise.resolve(null);
            promise.abort = () => { };
            return promise;
        }
        const element = (0, utils_dom_1.getElementByUrl)(this._HTMLDocument, url);
        const urlAsUrl = new url_1.URL(url);
        let resourceUrl = urlAsUrl.href;
        if (!urlAsUrl.protocol) {
            resourceUrl = new url_1.URL(resourceUrl, this._connector.finalHref).href;
        }
        if (this._connector.fetchedHrefs.has(resourceUrl)) {
            return null;
        }
        this._connector.fetchedHrefs.add(resourceUrl);
        debug(`resource ${resourceUrl} to be fetched`);
        let abort;
        const promise = new Promise(async (resolve, reject) => {
            abort = reject;
            await this._connector.server.emitAsync('fetch::start', { resource: resourceUrl });
            try {
                const resourceNetworkData = await this._connector.fetchContent(resourceUrl);
                debug(`resource ${resourceUrl} fetched`);
                const fetchEndEvent = {
                    element,
                    request: resourceNetworkData.request,
                    resource: resourceNetworkData.response.url,
                    response: resourceNetworkData.response
                };
                const { charset, mediaType } = await (0, utils_1.getContentTypeData)(element, fetchEndEvent.resource, fetchEndEvent.response.headers, fetchEndEvent.response.body.rawContent);
                const type = mediaType ? (0, utils_1.getType)(mediaType) : 'unknown';
                fetchEndEvent.response.mediaType = mediaType;
                fetchEndEvent.response.charset = charset;
                await this._connector.server.emitAsync(`fetch::end::${type}`, fetchEndEvent);
                return resolve(resourceNetworkData.response.body.rawContent);
            }
            catch (err) {
                const error = err;
                const hops = this._connector.request.getRedirects(error.uri);
                const fetchError = {
                    element: element,
                    error: error.error,
                    hops,
                    resource: error.uri || resourceUrl
                };
                await this._connector.server.emitAsync('fetch::error', fetchError);
                return reject(fetchError);
            }
        });
        promise.abort = () => {
            const error = new Error('request canceled by user');
            abort(error);
        };
        return promise;
    }
}
exports.default = CustomResourceLoader;
