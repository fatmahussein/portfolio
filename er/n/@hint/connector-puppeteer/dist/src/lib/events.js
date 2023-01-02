"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onResponseHandler = exports.onRequestFailedHandler = exports.onRequestHandler = void 0;
const utils_1 = require("@hint/utils");
const utils_debug_1 = require("@hint/utils-debug");
const create_fetchend_payload_1 = require("./create-fetchend-payload");
const get_element_from_response_1 = require("./get-element-from-response");
const debug = (0, utils_debug_1.debug)(__filename);
const onRequestHandler = (request) => {
    const requestUrl = request.url();
    const event = { resource: requestUrl };
    const name = request.isNavigationRequest() ?
        'fetch::start::target' :
        'fetch::start';
    debug(`Request started: ${requestUrl}`);
    return {
        name,
        payload: event
    };
};
exports.onRequestHandler = onRequestHandler;
const onRequestFailedHandler = (request, dom) => {
    const resource = request.url();
    if (!dom) {
        return null;
    }
    debug(`Request failed: ${resource}`);
    const element = (0, get_element_from_response_1.getElementFromResponse)(request, dom);
    const hops = request.redirectChain()
        .map((redirect) => {
        return redirect.url();
    });
    const event = {
        element,
        error: request.failure(),
        hops,
        resource
    };
    return {
        name: 'fetch::error',
        payload: event
    };
};
exports.onRequestFailedHandler = onRequestFailedHandler;
const onResponseHandler = async (response, fetchContent, dom) => {
    const resource = response.url();
    const isTarget = response.request().isNavigationRequest();
    debug(`Response received: ${resource}`);
    if (!dom && !isTarget) {
        return null;
    }
    const payload = await (0, create_fetchend_payload_1.createFetchEndPayload)(response, fetchContent, dom);
    let suffix = (0, utils_1.getType)(payload.response.mediaType);
    const defaults = ['html', 'unknown', 'xml'];
    if (isTarget && defaults.includes(suffix)) {
        suffix = 'html';
    }
    const name = `fetch::end::${suffix}`;
    return {
        name,
        payload
    };
};
exports.onResponseHandler = onResponseHandler;
