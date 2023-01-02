"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavicon = void 0;
const url_1 = require("url");
const utils_debug_1 = require("@hint/utils-debug");
const debug = (0, utils_debug_1.debug)(__filename);
const getFavicon = async (dom, fetchContent, engine) => {
    const element = (await dom.querySelectorAll('link[rel~="icon"]'))[0];
    const href = (element && element.getAttribute('href')) || '/favicon.ico';
    try {
        debug(`resource ${href} to be fetched`);
        const fullFaviconUrl = dom.resolveUrl(href);
        await engine.emitAsync('fetch::start', { resource: fullFaviconUrl });
        const content = await fetchContent(new url_1.URL(fullFaviconUrl));
        const data = {
            element: null,
            request: content.request,
            resource: content.response.url,
            response: content.response
        };
        await engine.emitAsync('fetch::end::image', data);
    }
    catch (error) {
        const event = {
            element,
            error,
            hops: [],
            resource: href
        };
        await engine.emitAsync('fetch::error', event);
    }
};
exports.getFavicon = getFavicon;
