"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const types_1 = require("hint/dist/src/lib/types");
const walk_1 = require("@hint/parser-javascript/dist/src/walk");
const debug = (0, utils_debug_1.debug)(__filename);
let TypeScriptESTree = null;
try {
    TypeScriptESTree = require('@typescript-eslint/typescript-estree');
}
catch (e) {
    debug(`Unable to load TypeScript parser: ${e}`);
}
if (TypeScriptESTree) {
    for (const type of Object.keys(TypeScriptESTree.AST_NODE_TYPES)) {
        if (type === TypeScriptESTree.AST_NODE_TYPES.PropertyDefinition) {
            walk_1.base[type] = (node, st, c) => {
                if (node.value) {
                    c(node.value, st);
                }
            };
        }
        if (!walk_1.base[type]) {
            walk_1.base[type] = walk_1.base.Identifier;
        }
    }
}
class TypeScriptParser extends types_1.Parser {
    constructor(engine) {
        super(engine, 'typescript');
        engine.on('fetch::end::unknown', async ({ resource, response }) => {
            if (!resource.endsWith('.ts') && !resource.endsWith('.tsx')) {
                return;
            }
            if (!TypeScriptESTree) {
                return;
            }
            debug(`Parsing TypeScript file: ${resource}`);
            const sourceCode = response.body.content;
            const jsx = resource.endsWith('.tsx');
            try {
                await engine.emitAsync('parse::start::javascript', { resource });
                const result = TypeScriptESTree.parse(sourceCode, { jsx, loc: true, useJSXTextNode: jsx });
                await (0, walk_1.combineWalk)(async (walk) => {
                    await engine.emitAsync('parse::end::javascript', {
                        ast: result,
                        element: null,
                        resource,
                        sourceCode,
                        tokens: result.tokens,
                        walk
                    });
                });
            }
            catch (err) {
                debug(`Error parsing TypeScript code (${err}): ${sourceCode}`);
            }
        });
    }
}
exports.default = TypeScriptParser;
