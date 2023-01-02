"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser = require('postcss-less');
const postcss = require('postcss');
const utils_debug_1 = require("@hint/utils-debug");
const utils_string_1 = require("@hint/utils-string");
const types_1 = require("hint/dist/src/lib/types");
const debug = (0, utils_debug_1.debug)(__filename);
class CSSParser extends types_1.Parser {
    constructor(engine) {
        super(engine, 'less');
        const emitLESS = async (code, resource, element) => {
            try {
                await this.engine.emitAsync(`parse::start::css`, { resource });
                const result = await postcss().process(code, { from: resource, parser });
                const ast = result.root;
                await this.engine.emitAsync(`parse::end::css`, {
                    ast,
                    code,
                    element,
                    resource
                });
            }
            catch (err) {
                debug(`Error parsing LESS code: ${code} - ${err}`);
            }
        };
        engine.on('fetch::end::*', async (fetchEnd) => {
            const code = fetchEnd.response.body.content;
            const mediaType = fetchEnd.response.mediaType;
            const resource = fetchEnd.resource;
            if (mediaType === 'text/less' || mediaType === 'text/x-less') {
                await emitLESS(code, resource, null);
            }
        });
        engine.on('element::style', async ({ element, resource }) => {
            const type = (0, utils_string_1.normalizeString)(element.getAttribute('type'));
            if (type === 'text/less' || type === 'text/x-less') {
                await emitLESS(element.innerHTML, resource, element);
            }
        });
    }
}
exports.default = CSSParser;
