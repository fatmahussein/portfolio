"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLElement = void 0;
const parse5 = require("parse5");
const htmlparser2Adapter = require("parse5-htmlparser2-tree-adapter");
const css_select_1 = require("css-select");
const find_original_element_1 = require("./find-original-element");
const node_1 = require("./node");
const cssstyledeclaration_1 = require("./cssstyledeclaration");
const get_compiled_selector_1 = require("./get-compiled-selector");
class HTMLElement extends node_1.Node {
    constructor(element, ownerDocument) {
        super(element, ownerDocument);
        this._domRect = {
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            toJSON() {
                return this;
            },
            top: 0,
            width: 0,
            x: 0,
            y: 0
        };
        this._element = element;
        this._computedStyles = new cssstyledeclaration_1.CSSStyleDeclaration(element['x-styles']);
        if (element['x-rects']) {
            this._domRect.x = element['x-rects'].clientRect.x;
            this._domRect.y = element['x-rects'].clientRect.y;
            this._domRect.left = element['x-rects'].clientRect.x;
            this._domRect.top = element['x-rects'].clientRect.y;
            this._domRect.width = element['x-rects'].clientRect.width;
            this._domRect.height = element['x-rects'].clientRect.height;
            this._domRect.right = this._domRect.x + this._domRect.width;
            this._domRect.bottom = this._domRect.y + this._domRect.height;
        }
    }
    get attributes() {
        const x = this._element.attribs;
        return Object.entries(x).map(([name, value]) => {
            return {
                name,
                nodeName: name,
                nodeValue: value,
                value
            };
        });
    }
    get children() {
        return this.childNodes.filter((node) => {
            return node instanceof HTMLElement;
        });
    }
    get id() {
        return this.getAttribute('id') || '';
    }
    get name() {
        return this.getAttribute('name') || '';
    }
    get style() {
        return {
            getPropertyValue(name) {
                return;
            }
        };
    }
    get type() {
        if (this.nodeName === 'BUTTON') {
            return this.getAttribute('type') || 'submit';
        }
        else if (this.nodeName === 'INPUT') {
            return this.getAttribute('type') || 'text';
        }
        return '';
    }
    getAttribute(name) {
        const attrib = this._element.attribs[name];
        const value = typeof attrib !== 'undefined' ? attrib : null;
        return value;
    }
    getBoundingClientRect() {
        return this._domRect;
    }
    getComputedStyle() {
        return this._computedStyles;
    }
    hasAttribute(name) {
        return this.getAttribute(name) !== null;
    }
    hasAttributes() {
        return Object.keys(this._element.attribs).length > 0;
    }
    setAttribute(name, value) {
        this._element.attribs[name] = value;
    }
    hasAttributeSpread() {
        return this.hasAttribute('{...spread}');
    }
    isAttributeAnExpression(attribute) {
        const value = this.getAttribute(attribute);
        return value ? value.includes('{') : false;
    }
    _getOriginalLocation() {
        const location = this._element.sourceCodeLocation;
        if (location) {
            return location;
        }
        if (this.ownerDocument.originalDocument) {
            const match = (0, find_original_element_1.findOriginalElement)(this.ownerDocument.originalDocument, this);
            if (match) {
                return match._element.sourceCodeLocation || null;
            }
        }
        return null;
    }
    getAttributeLocation(name) {
        var _a;
        const elementLocation = this._getOriginalLocation();
        const location = (_a = elementLocation === null || elementLocation === void 0 ? void 0 : elementLocation.attrs) === null || _a === void 0 ? void 0 : _a[name];
        return {
            column: location ? location.startCol - 1 : -1,
            endColumn: location ? location.endCol - 1 : -1,
            endLine: location ? location.endLine - 1 : -1,
            endOffset: location ? location.endOffset : -1,
            line: location ? location.startLine - 1 : -1,
            startOffset: location ? location.startOffset : -1
        };
    }
    getLocation() {
        const location = this._getOriginalLocation();
        return {
            column: location ? location.startCol - 1 : -1,
            elementId: this._element.id,
            endColumn: location ? location.endCol - 1 : -1,
            endLine: location ? location.endLine - 1 : -1,
            endOffset: location ? location.endOffset : -1,
            line: location ? location.startLine - 1 : -1,
            startOffset: location ? location.startOffset : -1
        };
    }
    getContentLocation(offset) {
        const location = this._getOriginalLocation();
        if (!location) {
            return null;
        }
        const startTag = location.startTag;
        const column = startTag.endCol - 1;
        const line = startTag.endLine - 1;
        if (offset.line === 0) {
            return {
                column: column + offset.column,
                endColumn: offset.endColumn && (offset.endLine === 0 ? column + offset.endColumn : offset.endColumn),
                endLine: offset.endLine && (line + offset.endLine),
                line
            };
        }
        return {
            column: offset.column,
            endColumn: offset.endColumn,
            endLine: offset.endLine && (line + offset.endLine),
            line: line + offset.line
        };
    }
    isSame(element) {
        return this._element === element._element;
    }
    get innerHTML() {
        return parse5.serialize(this._element, { treeAdapter: htmlparser2Adapter });
    }
    querySelector(selector) {
        const data = (0, css_select_1.selectOne)((0, get_compiled_selector_1.getCompiledSelector)(selector), this._element);
        return data ? this.ownerDocument.getNodeFromData(data) : null;
    }
    querySelectorAll(selector) {
        const matches = (0, css_select_1.default)((0, get_compiled_selector_1.getCompiledSelector)(selector), this._element);
        const result = matches.map((element) => {
            return this.ownerDocument.getNodeFromData(element);
        });
        return result;
    }
    matches(selector) {
        return (0, get_compiled_selector_1.getCompiledSelector)(selector)(this._element);
    }
    get outerHTML() {
        const fragment = htmlparser2Adapter.createDocumentFragment();
        const { parent, next, prev } = this._element;
        htmlparser2Adapter.appendChild(fragment, this._element);
        const result = parse5.serialize(fragment, { treeAdapter: htmlparser2Adapter });
        this._element.parent = parent;
        this._element.next = next;
        this._element.prev = prev;
        if (next) {
            next.prev = this._element;
        }
        if (prev) {
            prev.next = this._element;
        }
        return result;
    }
    resolveUrl(url) {
        return this.ownerDocument.resolveUrl(url);
    }
    getChildIndent() {
        const newlineType = this.outerHTML.indexOf('\r\n') === -1 ? '\n' : '\r\n';
        const splitByLine = this.outerHTML.split(newlineType);
        if (splitByLine.length === 1) {
            return { indent: '', newlineType: '' };
        }
        if (splitByLine.length === 2) {
            const lastLine = splitByLine[splitByLine.length - 1];
            const nonSpaceInd = lastLine.search(/[^ ]/);
            const indent = `${lastLine.substring(0, nonSpaceInd)}  `;
            return { indent, newlineType };
        }
        const childLine = splitByLine[1];
        const nonSpaceInd = childLine.search(/[^ ]/);
        return { indent: childLine.substring(0, nonSpaceInd), newlineType };
    }
    prependChildOuterHtml(child, removeExistingInstance) {
        const openingTagRegex = /<[^>]+>/;
        const childIndent = this.getChildIndent();
        const outerHTML = removeExistingInstance ? this.outerHTML.replace(child, '') : this.outerHTML;
        const tagMatch = outerHTML.match(openingTagRegex);
        if (tagMatch) {
            const childInsertionInd = tagMatch[0].length;
            const newLineWithIndent = (childIndent === null || childIndent === void 0 ? void 0 : childIndent.newlineType) && (childIndent === null || childIndent === void 0 ? void 0 : childIndent.indent) ? `${childIndent === null || childIndent === void 0 ? void 0 : childIndent.newlineType}${childIndent === null || childIndent === void 0 ? void 0 : childIndent.indent}` : '';
            return outerHTML.substring(0, childInsertionInd) + newLineWithIndent + child + outerHTML.substring(childInsertionInd);
        }
        return this.outerHTML;
    }
}
exports.HTMLElement = HTMLElement;
