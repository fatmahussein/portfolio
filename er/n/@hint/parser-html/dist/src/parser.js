"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_dom_1 = require("@hint/utils-dom");
const types_1 = require("hint/dist/src/lib/types");
__exportStar(require("./types"), exports);
class HTMLParser extends types_1.Parser {
    constructor(engine) {
        super(engine, 'html');
        engine.on('fetch::end::html', this.onFetchEnd.bind(this));
    }
    async onFetchEnd(fetchEnd) {
        const resource = fetchEnd.resource;
        await this.engine.emitAsync(`parse::start::html`, { resource });
        const html = fetchEnd.response.body.content;
        const document = (0, utils_dom_1.createHTMLDocument)(html, fetchEnd.resource);
        await this.engine.emitAsync('parse::end::html', { document, html, resource });
    }
}
exports.default = HTMLParser;
