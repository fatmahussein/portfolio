"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSSStyleDeclaration = void 0;
class CSSStyleDeclaration {
    constructor(styles = {}) {
        this._styles = styles;
    }
    getPropertyValue(name) {
        return this._styles[name] || '';
    }
}
exports.CSSStyleDeclaration = CSSStyleDeclaration;
