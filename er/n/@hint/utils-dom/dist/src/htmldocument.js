"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLDocument = void 0;
const url_1 = require("url");
const parse5 = require("parse5");
const htmlparser2Adapter = require("parse5-htmlparser2-tree-adapter");
const css_select_1 = require("css-select");
const create_element_1 = require("./create-element");
const comment_1 = require("./comment");
const documenttype_1 = require("./documenttype");
const node_1 = require("./node");
const text_1 = require("./text");
const get_compiled_selector_1 = require("./get-compiled-selector");
const utils_1 = require("./utils");
class HTMLDocument extends node_1.Node {
    constructor(document, finalHref, originalDocument, isFragment = false) {
        super(document, null);
        this._nodes = new Map();
        this._pageHTML = '';
        this._document = document;
        this._documentElement = this.findDocumentElement();
        this._isFragment = isFragment;
        this.originalDocument = originalDocument;
        if (isFragment) {
            (0, utils_1.ensureExpectedParentNodes)(document);
        }
        this._pageHTML = parse5.serialize(document, { treeAdapter: htmlparser2Adapter });
        this._base = this.getBaseUrl(finalHref);
        this._nodes.set(document, this);
    }
    findDocumentElement() {
        return this._document.children.find((node) => {
            return node.type === 'tag' && node.name === 'html';
        });
    }
    getBaseUrl(finalHref) {
        const baseElement = this.querySelector('base[href]');
        const baseHref = baseElement ? baseElement.getAttribute('href') : null;
        if (!baseHref) {
            return new url_1.URL(finalHref).href;
        }
        return new url_1.URL(baseHref, finalHref).href;
    }
    get documentElement() {
        return this.getNodeFromData(this._documentElement);
    }
    get base() {
        return this._base;
    }
    get body() {
        return this.querySelector('body');
    }
    get compatMode() {
        return this._document['x-mode'] === 'quirks' ?
            'BackCompat' :
            'CSS1Compat';
    }
    get isFragment() {
        return this._isFragment;
    }
    get title() {
        var _a;
        return ((_a = this.querySelector('title')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
    }
    createElement(data) {
        return (0, create_element_1.createElement)(data, this);
    }
    getNodeFromData(data) {
        if (this._nodes.has(data)) {
            return this._nodes.get(data);
        }
        let node;
        switch (data.type) {
            case 'comment':
                node = new comment_1.Comment(data, this);
                break;
            case 'directive':
                node = new documenttype_1.DocumentType(data, this);
                break;
            case 'script':
            case 'style':
            case 'tag':
                node = (0, create_element_1.createElement)(data.name, this, data);
                break;
            case 'text':
                node = new text_1.Text(data, this);
                break;
            default:
                throw new Error(`Unsupported node type: ${data.type}`);
        }
        this._nodes.set(data, node);
        return node;
    }
    elementsFromPoint(x, y) {
        return [];
    }
    pageHTML() {
        return this._pageHTML;
    }
    querySelector(selector) {
        const data = (0, css_select_1.selectOne)((0, get_compiled_selector_1.getCompiledSelector)(selector), this._document.children);
        return data ? this.getNodeFromData(data) : null;
    }
    querySelectorAll(selector) {
        const matches = (0, css_select_1.default)((0, get_compiled_selector_1.getCompiledSelector)(selector), this._document.children);
        const result = matches.map((element) => {
            return this.getNodeFromData(element);
        });
        return result;
    }
    resolveUrl(url) {
        return new url_1.URL(url, this._base).href;
    }
}
exports.HTMLDocument = HTMLDocument;
