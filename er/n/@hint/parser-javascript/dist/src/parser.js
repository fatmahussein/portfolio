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
const acorn_1 = require("acorn");
const utils_debug_1 = require("@hint/utils-debug");
const content_type_1 = require("@hint/utils/dist/src/content-type");
const types_1 = require("hint/dist/src/lib/types");
const walk_1 = require("./walk");
__exportStar(require("./types"), exports);
const debug = (0, utils_debug_1.debug)(__filename);
const jsx = require('acorn-jsx');
const jsParser = acorn_1.Parser.extend();
const jsxParser = jsx ? acorn_1.Parser.extend(jsx()) : acorn_1.Parser.extend();
class JavascriptParser extends types_1.Parser {
    constructor(engine) {
        super(engine, 'javascript');
        engine.on('fetch::end::script', this.parseJavascript.bind(this));
        engine.on('fetch::end::unknown', this.onFetchUnknown.bind(this));
        engine.on('element::script', this.parseJavascriptTag.bind(this));
    }
    async emitScript(parser, sourceCode, resource, element) {
        try {
            await this.engine.emitAsync(`parse::start::javascript`, { resource });
            const options = { ecmaVersion: 'latest', locations: true, ranges: true };
            const ast = parser.parse(sourceCode, options);
            const tokens = [...parser.tokenizer(sourceCode, options)];
            await (0, walk_1.combineWalk)(async (walk) => {
                await this.engine.emitAsync(`parse::end::javascript`, {
                    ast,
                    element,
                    resource,
                    sourceCode,
                    tokens,
                    walk
                });
            });
        }
        catch (err) {
            debug(`Error parsing JS code (${err}): ${sourceCode}`);
        }
    }
    async onFetchUnknown(fetchEnd) {
        if (fetchEnd.response.mediaType !== 'text/jsx') {
            return;
        }
        const code = fetchEnd.response.body.content;
        const resource = fetchEnd.resource;
        await this.emitScript(jsxParser, code, resource, null);
    }
    async parseJavascript(fetchEnd) {
        const code = fetchEnd.response.body.content;
        const resource = fetchEnd.resource;
        await this.emitScript(jsParser, code, resource, null);
    }
    hasSrcAttribute(element) {
        const src = element.getAttribute('src');
        return !!src;
    }
    isJavaScriptType(element) {
        const type = (0, content_type_1.determineMediaTypeForScript)(element);
        return !!type;
    }
    async parseJavascriptTag({ element, resource }) {
        if (this.hasSrcAttribute(element)) {
            return;
        }
        if (!this.isJavaScriptType(element)) {
            return;
        }
        await this.emitScript(jsParser, element.innerHTML, resource, element);
    }
}
exports.default = JavascriptParser;
