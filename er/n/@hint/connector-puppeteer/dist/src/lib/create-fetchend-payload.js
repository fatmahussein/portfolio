"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFetchEndPayload = void 0;
const utils_1 = require("@hint/utils");
const utils_connector_tools_1 = require("@hint/utils-connector-tools");
const get_element_from_response_1 = require("./get-element-from-response");
const getRawResponse = (response, fetchContent) => {
    return async function () {
        const that = this;
        if (that._rawResponse) {
            return that._rawResponse;
        }
        const rawContent = await response.buffer();
        const responseHeaders = (0, utils_connector_tools_1.normalizeHeaders)(response.headers());
        if (rawContent && rawContent.length.toString() === responseHeaders['content-length']) {
            return rawContent;
        }
        const requestHeaders = response.request().headers();
        const responseUrl = response.url();
        const validHeaders = Object.entries(requestHeaders).reduce((final, [key, value]) => {
            if (key.startsWith(':')) {
                return final;
            }
            final[key] = value;
            return final;
        }, {});
        return fetchContent(responseUrl, validHeaders)
            .then((result) => {
            const { response: { body: { rawResponse: rr } } } = result;
            return rr();
        })
            .then((value) => {
            that._rawResponse = value;
            return value;
        });
    };
};
const createFetchEndPayload = async (response, fetchContent, dom) => {
    const resourceUrl = response.url();
    const hops = response.request()
        .redirectChain()
        .map((request) => {
        return request.url();
    });
    const originalUrl = hops[0] || resourceUrl;
    const networkRequest = {
        headers: (0, utils_connector_tools_1.normalizeHeaders)(response.request().headers()),
        url: originalUrl
    };
    const element = await (0, get_element_from_response_1.getElementFromResponse)(response, dom);
    const [content, rawContent] = await Promise.all([
        response.text(),
        response.buffer()
    ])
        .catch((e) => {
        return ['', Buffer.alloc(0)];
    });
    const body = {
        content,
        rawContent: rawContent || Buffer.alloc(0),
        rawResponse: getRawResponse(response, fetchContent)
    };
    const responseHeaders = (0, utils_connector_tools_1.normalizeHeaders)(response.headers());
    const { charset, mediaType } = await (0, utils_1.getContentTypeData)(element, originalUrl, responseHeaders, body.rawContent);
    const networkResponse = {
        body,
        charset: charset,
        headers: responseHeaders,
        hops,
        mediaType: mediaType,
        statusCode: response.status(),
        url: response.url()
    };
    const data = {
        element,
        request: networkRequest,
        resource: resourceUrl,
        response: networkResponse
    };
    return data;
};
exports.createFetchEndPayload = createFetchEndPayload;
