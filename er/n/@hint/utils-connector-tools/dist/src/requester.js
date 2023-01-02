"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Requester = void 0;
const url = require("url");
const util_1 = require("util");
const zlib = require("zlib");
const node_fetch_1 = require("node-fetch");
const https = require("https");
const iconv = require("iconv-lite");
const parseDataURL = require("data-urls");
const utils_1 = require("@hint/utils");
const utils_network_1 = require("@hint/utils-network");
const utils_debug_1 = require("@hint/utils-debug");
const utils_string_1 = require("@hint/utils-string");
const redirects_1 = require("./redirects");
const debug = (0, utils_debug_1.debug)(__filename);
const decompressBrotli = (0, util_1.promisify)(zlib.brotliDecompress);
const decompressGzip = (0, util_1.promisify)(zlib.gunzip);
const inflateAsync = (0, util_1.promisify)(zlib.inflate);
const inflateRawAsync = (0, util_1.promisify)(zlib.inflateRaw);
const inflate = (buff) => {
    if ((buff[0] & 0x0f) === 8 && (buff.readUInt16BE(0) % 31 === 0)) {
        return inflateAsync(buff);
    }
    return inflateRawAsync(buff);
};
const identity = (buff) => {
    return Promise.resolve(Buffer.from(buff));
};
const defaults = {
    compress: false,
    headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.8,es;q=0.6,fr;q=0.4',
        'Cache-Control': 'no-cache',
        DNT: '1',
        Pragma: 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36 Edg/104.0.1293.70'
    },
    redirect: 'manual',
    rejectUnauthorized: false,
    strictSSL: false,
    timeout: 30000
};
class Requester {
    constructor(customOptions) {
        this._redirects = new redirects_1.RedirectManager();
        this._maxRedirects = 10;
        if (customOptions) {
            customOptions.redirect = 'manual';
            if (customOptions.follow && customOptions.follow >= 0) {
                this._maxRedirects = customOptions.follow;
            }
            if (customOptions.headers) {
                customOptions.headers = Object.assign(Object.assign({}, (0, utils_string_1.toLowerCaseKeys)(defaults.headers)), (0, utils_string_1.toLowerCaseKeys)(customOptions.headers));
            }
        }
        const options = Object.assign(Object.assign({}, defaults), customOptions);
        this._options = options;
    }
    async tryToDecompress(decompressor, content) {
        try {
            const result = await decompressor(content);
            return result;
        }
        catch (e) {
            return null;
        }
    }
    decompressors(algorithm) {
        const priorities = {
            br: 0,
            gzip: 1,
            deflate: 2,
            identity: 3
        };
        const functions = [
            decompressBrotli,
            decompressGzip,
            inflate,
            identity
        ];
        const priority = typeof priorities[algorithm.trim()] === 'undefined' ?
            priorities.identity :
            priorities[algorithm];
        return functions.slice(priority);
    }
    async decompressResponse(contentEncoding, rawBodyResponse) {
        const that = this;
        const algorithms = contentEncoding ?
            contentEncoding.split(',') :
            [''];
        const decompressors = this.decompressors(algorithms.shift().trim());
        let rawBody = null;
        for (const decompressor of decompressors) {
            rawBody = await that.tryToDecompress(decompressor, rawBodyResponse);
            if (rawBody) {
                break;
            }
        }
        if (rawBody && algorithms.length > 0) {
            return this.decompressResponse(algorithms.join(','), rawBody);
        }
        return rawBody;
    }
    getRedirects(uri) {
        return this._redirects.calculate(uri);
    }
    getResourceNetworkDataFromDataUri(uri) {
        const parsedDataURL = parseDataURL(uri);
        const networkData = {
            request: {
                headers: {},
                url: uri
            },
            response: {
                body: {
                    content: parsedDataURL.body,
                    rawContent: parsedDataURL.body,
                    rawResponse: () => {
                        return Promise.resolve(parsedDataURL.body);
                    }
                },
                charset: parsedDataURL.mimeType.parameters.get('charset') || '',
                headers: {},
                hops: [],
                mediaType: parsedDataURL.mimeType.toString(),
                statusCode: 200,
                url: uri
            }
        };
        return networkData;
    }
    get(uri) {
        debug(`Requesting ${uri}`);
        if (uri.startsWith('data:')) {
            return Promise.resolve(this.getResourceNetworkDataFromDataUri(uri));
        }
        const requestedUrls = new Set();
        const getUri = (uriString) => {
            let rawBodyResponse;
            requestedUrls.add(uriString);
            return new Promise(async (resolve, reject) => {
                try {
                    let isHTTPS = false;
                    if (uriString.startsWith('https')) {
                        isHTTPS = true;
                    }
                    let agent;
                    if (this._options.strictSSL || isHTTPS) {
                        let httpsAgentOptions;
                        if (this._options.rejectUnauthorized !== undefined) {
                            httpsAgentOptions = { rejectUnauthorized: this._options.rejectUnauthorized };
                        }
                        const httpsAgent = new https.Agent(httpsAgentOptions);
                        agent = httpsAgent;
                    }
                    const response = await (0, node_fetch_1.default)(uriString, Object.assign(Object.assign({}, this._options), { agent }));
                    rawBodyResponse = await response.buffer();
                    if (Requester.validRedirects.includes(response.status)) {
                        if (!response.headers.get('location')) {
                            const error = {
                                error: new Error('Redirect location undefined'),
                                uri: uriString
                            };
                            return reject(error);
                        }
                        const newUri = url.resolve(uriString, response.headers.get('location'));
                        if (requestedUrls.has(newUri)) {
                            return reject(new Error(`'${uriString}' could not be fetched using ${this._options.method || 'GET'} method (redirect loop detected).`));
                        }
                        this._redirects.add(newUri, uriString);
                        const currentRedirectNumber = this._redirects.calculate(newUri).length;
                        if (currentRedirectNumber > this._maxRedirects) {
                            return reject(new Error(`The number of redirects(${currentRedirectNumber}) exceeds the limit(${this._maxRedirects}).`));
                        }
                        debug(`Redirect found for ${uriString}`);
                        try {
                            const results = await getUri(newUri);
                            return resolve(results);
                        }
                        catch (e) {
                            return reject(e);
                        }
                    }
                    const responseHeaders = {};
                    let requestHeaders = {};
                    Array.from(response.headers, ([name, value]) => {
                        responseHeaders[name] = value;
                        return { name, value };
                    });
                    if (this._options.headers) {
                        if (this._options.headers.entries) {
                            const castedHeaders = this._options.headers.entries();
                            for (const [key, value] of castedHeaders) {
                                if (typeof value === 'string') {
                                    requestHeaders[key] = value;
                                }
                            }
                        }
                        else if (typeof this._options.headers === typeof [[]]) {
                            requestHeaders = this._options.headers;
                        }
                    }
                    const contentEncoding = (0, utils_network_1.normalizeHeaderValue)(responseHeaders, 'content-encoding');
                    const rawBody = await this.decompressResponse(contentEncoding, rawBodyResponse);
                    const contentTypeData = await (0, utils_1.getContentTypeData)(null, uri, responseHeaders, rawBody);
                    const charset = contentTypeData.charset || '';
                    const mediaType = contentTypeData.mediaType || '';
                    const hops = this._redirects.calculate(uriString);
                    const body = rawBody && iconv.encodingExists(charset) ? iconv.decode(rawBody, charset) : null;
                    const networkData = {
                        request: {
                            headers: requestHeaders,
                            url: hops[0] || uriString
                        },
                        response: {
                            body: {
                                content: body,
                                rawContent: rawBody,
                                rawResponse: () => {
                                    return Promise.resolve(rawBodyResponse);
                                }
                            },
                            charset,
                            headers: responseHeaders,
                            hops,
                            mediaType,
                            statusCode: response.status,
                            url: uriString
                        }
                    };
                    return resolve(networkData);
                }
                catch (err) {
                    const error = {
                        error: err,
                        uri: uriString
                    };
                    return reject(error);
                }
            });
        };
        return getUri(uri);
    }
}
exports.Requester = Requester;
Requester.validRedirects = [301, 302, 303, 307, 308];
