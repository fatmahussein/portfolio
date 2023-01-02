"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const svgElements_1 = require("./svgElements");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class CreateElementSvgHint {
    constructor(context) {
        context.on('parse::end::javascript', ({ ast, element, resource, sourceCode, walk }) => {
            debug('Validating hint create-element-svg');
            walk.simple(ast, {
                CallExpression(node) {
                    if (!('property' in node.callee && 'name' in node.callee.property)) {
                        return;
                    }
                    if (node.callee.property.name !== 'createElement') {
                        return;
                    }
                    const arg = node.arguments[0];
                    if (arg && 'value' in arg && typeof arg.value === 'string' && svgElements_1.default.has(arg.value.toLowerCase()) && node.arguments.length === 1) {
                        const message = (0, i18n_import_1.getMessage)('svgElementCannotBeCreated', context.language);
                        const loc = node.callee.property.loc;
                        const codeLanguage = 'javascript';
                        let codeSnippet = '';
                        let location = null;
                        if (loc) {
                            codeSnippet = sourceCode.substring(node.start, node.end);
                            location = {
                                column: loc.start.column,
                                line: loc.start.line - 1
                            };
                        }
                        context.report(resource, message, {
                            codeLanguage,
                            codeSnippet,
                            element,
                            location,
                            severity: utils_types_1.Severity.error
                        });
                    }
                }
            });
        });
    }
}
exports.default = CreateElementSvgHint;
CreateElementSvgHint.meta = meta_1.default;
