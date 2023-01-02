"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const parse5 = require("parse5");
const htmlparser2Adapter = require("parse5-htmlparser2-tree-adapter");
const utils_debug_1 = require("@hint/utils-debug");
const utils_dom_1 = require("@hint/utils-dom");
const types_1 = require("hint/dist/src/lib/types");
const HTML_ELEMENTS_WITH_ONLY_NON_TEXT_CHILDREN = [
    'colgroup',
    'dl',
    'hgroup',
    'menu',
    'ol',
    'optgroup',
    'picture',
    'select',
    'table',
    'tbody',
    'thead',
    'tfoot',
    'tr',
    'ul'
];
const EXPECTED_SPREAD_ATTRIBUTES = new Map([
    ['*', ['title']]
]);
const debug = (0, utils_debug_1.debug)(__filename);
const addExpectedSpreadAttributes = (tagName, attribs) => {
    var _a, _b;
    const localExpectedAttributes = (_a = EXPECTED_SPREAD_ATTRIBUTES.get(tagName)) !== null && _a !== void 0 ? _a : [];
    const globalExpectedAttributes = (_b = EXPECTED_SPREAD_ATTRIBUTES.get('*')) !== null && _b !== void 0 ? _b : [];
    const expectedAttributes = [...localExpectedAttributes, ...globalExpectedAttributes];
    for (const expectedAttribute of expectedAttributes) {
        if (!attribs[expectedAttribute]) {
            attribs[expectedAttribute] = '{expression}';
        }
    }
};
const isNativeElement = (node) => {
    if (node.type !== 'JSXElement') {
        return false;
    }
    if (node.openingElement.name.type !== 'JSXIdentifier') {
        return false;
    }
    const { name } = node.openingElement.name;
    return name[0] === name[0].toLowerCase();
};
const isAttributeOrNativeElement = (node) => {
    if (node.type === 'JSXAttribute') {
        return true;
    }
    return isNativeElement(node);
};
const mapLocation = (node) => {
    return {
        endCol: node.loc && (node.loc.end.column + 1) || -1,
        endLine: node.loc && node.loc.end.line || -1,
        endOffset: node.range && node.range[1] || -1,
        startCol: node.loc && (node.loc.start.column + 1) || -1,
        startLine: node.loc && node.loc.start.line || -1,
        startOffset: node.range && node.range[0] || -1
    };
};
const mapAttributeName = (name) => {
    if (name === 'className') {
        return 'class';
    }
    if (name === 'htmlFor') {
        return 'for';
    }
    return name;
};
const mapAttributes = (node, tagName) => {
    const attribs = {};
    const locations = {};
    let hasSpread = false;
    for (const attribute of node.openingElement.attributes) {
        if (attribute.type === 'JSXSpreadAttribute') {
            attribs['{...spread}'] = '';
            hasSpread = true;
            continue;
        }
        if (attribute.name.type !== 'JSXIdentifier') {
            continue;
        }
        if (attribute.value && attribute.value.type !== 'Literal' && attribute.value.type !== 'JSXExpressionContainer') {
            continue;
        }
        const name = mapAttributeName(attribute.name.name);
        if (!attribute.value) {
            attribs[name] = '';
        }
        else if (attribute.value.type === 'JSXExpressionContainer') {
            attribs[name] = `{expression}`;
        }
        else {
            attribs[name] = `${attribute.value.value}`;
        }
        locations[name] = mapLocation(attribute);
    }
    if (hasSpread) {
        addExpectedSpreadAttributes(tagName, attribs);
    }
    return {
        attribs,
        attrs: locations,
        'x-attribsNamespace': {},
        'x-attribsPrefix': {}
    };
};
const mapElement = (node, childMap) => {
    if (node.openingElement.name.type !== 'JSXIdentifier') {
        throw new Error('Can only map elements with known names');
    }
    const { name } = node.openingElement.name;
    const _a = mapAttributes(node, name), { attrs } = _a, attribs = __rest(_a, ["attrs"]);
    const children = childMap.get(node) || [];
    return Object.assign(Object.assign({}, attribs), { children,
        name, next: null, parent: null, prev: null, sourceCodeLocation: Object.assign({ attrs, endTag: node.closingElement ? mapLocation(node.closingElement) : undefined, startTag: Object.assign({ attrs }, mapLocation(node.openingElement)) }, mapLocation(node)), type: 'tag' });
};
const mapExpression = (node) => {
    return {
        data: '{expression}',
        next: null,
        parent: null,
        prev: null,
        sourceCodeLocation: mapLocation(node),
        type: 'text'
    };
};
const mapText = (node) => {
    return {
        data: node.value,
        next: null,
        parent: null,
        prev: null,
        sourceCodeLocation: mapLocation(node),
        type: 'text'
    };
};
const getParentElement = (ancestors) => {
    return ancestors
        .slice(0, -1)
        .reverse()
        .filter(isNativeElement)[0];
};
const getParentAttributeOrElement = (ancestors) => {
    return ancestors
        .slice(0, -1)
        .reverse()
        .filter(isAttributeOrNativeElement)[0];
};
const addChild = (data, parent, children) => {
    const list = children.get(parent) || [];
    list.push(data);
    children.set(parent, list);
};
const allowsTextChildren = (node) => {
    return node.openingElement.name.type === 'JSXIdentifier' &&
        !HTML_ELEMENTS_WITH_ONLY_NON_TEXT_CHILDREN.includes(node.openingElement.name.name);
};
const createHTMLFragment = (roots, resource) => {
    const dom = parse5.parse('', { treeAdapter: htmlparser2Adapter });
    const body = dom.children[0].children[1];
    roots.forEach((root) => {
        body.children.push(root);
    });
    (0, utils_dom_1.restoreReferences)(dom);
    return new utils_dom_1.HTMLDocument(dom, resource, undefined, true);
};
class JSXParser extends types_1.Parser {
    constructor(engine) {
        super(engine, 'jsx');
        engine.on('parse::end::javascript', ({ ast, resource, walk }) => {
            const roots = new Map();
            const childMap = new Map();
            walk.ancestor(ast, {
                JSXElement(node, ancestors = []) {
                    if (!isNativeElement(node)) {
                        return;
                    }
                    const data = mapElement(node, childMap);
                    const parent = getParentElement(ancestors);
                    if (parent) {
                        addChild(data, parent, childMap);
                    }
                    else {
                        roots.set(node, data);
                    }
                },
                JSXExpressionContainer(node, ancestors = []) {
                    const data = mapExpression(node);
                    const parent = getParentAttributeOrElement(ancestors);
                    if (parent && parent.type !== 'JSXAttribute' && allowsTextChildren(parent)) {
                        addChild(data, parent, childMap);
                    }
                },
                JSXText(node, ancestors = []) {
                    const data = mapText(node);
                    const parent = getParentElement(ancestors);
                    if (parent) {
                        addChild(data, parent, childMap);
                    }
                }
            });
            walk.onComplete(async () => {
                if (!roots.size) {
                    return;
                }
                await this.engine.emitAsync(`parse::start::html`, { resource });
                const document = createHTMLFragment(roots, resource);
                const html = document.documentElement.outerHTML;
                debug('Generated HTML from JSX:', html);
                await this.engine.emitAsync('parse::end::html', { document, html, resource });
            });
        });
    }
}
exports.default = JSXParser;
