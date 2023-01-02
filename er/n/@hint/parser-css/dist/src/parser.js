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
const safe = require('postcss-safe-parser');
const postcss = require('postcss');
const logger = require("@hint/utils/dist/src/logging");
const utils_string_1 = require("@hint/utils-string");
const types_1 = require("hint/dist/src/lib/types");
__exportStar(require("./types"), exports);
class CSSParser extends types_1.Parser {
    constructor(engine) {
        super(engine, 'css');
        engine.on('fetch::end::css', this.parseCSS.bind(this));
        engine.on('element::style', this.parseStyleTag.bind(this));
    }
    async emitCSS(code, resource, element) {
        try {
            await this.engine.emitAsync(`parse::start::css`, { resource });
            const result = await postcss().process(code, { from: resource, parser: safe });
            const ast = result.root;
            await this.engine.emitAsync(`parse::end::css`, {
                ast,
                code,
                element,
                resource
            });
        }
        catch (err) {
            logger.error(`Error parsing CSS code: ${code} - ${err}`);
        }
    }
    async parseCSS(fetchEnd) {
        const code = fetchEnd.response.body.content;
        const resource = fetchEnd.resource;
        await this.emitCSS(code, resource, null);
    }
    isCSSType(element) {
        const type = (0, utils_string_1.normalizeString)(element.getAttribute('type'));
        return !type || type === 'text/css';
    }
    async parseStyleTag({ element, resource }) {
        if (!this.isCSSType(element)) {
            return;
        }
        await this.emitCSS(element.innerHTML, resource, element);
    }
}
exports.default = CSSParser;
