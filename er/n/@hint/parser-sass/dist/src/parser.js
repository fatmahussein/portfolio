"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sassParser = require('postcss-sass');
const scssParser = require('postcss-scss');
const postcss = require('postcss');
const utils_debug_1 = require("@hint/utils-debug");
const utils_string_1 = require("@hint/utils-string");
const types_1 = require("hint/dist/src/lib/types");
const debug = (0, utils_debug_1.debug)(__filename);
class CSSParser extends types_1.Parser {
    constructor(engine) {
        super(engine, 'sass');
        const emitSASS = async (code, parser, resource, element) => {
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
                debug(`Error parsing SASS code: ${code} - ${err}`);
            }
        };
        engine.on('fetch::end::*', async (fetchEnd) => {
            const code = fetchEnd.response.body.content;
            const resource = fetchEnd.resource;
            if (fetchEnd.response.mediaType === 'text/x-sass') {
                await emitSASS(code, sassParser, resource, null);
            }
            else if (fetchEnd.response.mediaType === 'text/x-scss') {
                await emitSASS(code, scssParser, resource, null);
            }
        });
        engine.on('element::style', async ({ element, resource }) => {
            const lang = (0, utils_string_1.normalizeString)(element.getAttribute('lang'));
            if (lang === 'sass') {
                await emitSASS(element.innerHTML, sassParser, resource, element);
            }
            else if (lang === 'scss') {
                await emitSASS(element.innerHTML, scssParser, resource, element);
            }
        });
    }
}
exports.default = CSSParser;
