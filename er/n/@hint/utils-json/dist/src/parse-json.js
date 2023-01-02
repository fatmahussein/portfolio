"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJSON = void 0;
const jsonc_parser_1 = require("jsonc-parser");
const rxIsNumber = /^[0-9]+$/;
class JSONResult {
    constructor(data, root, lines, alternatePath) {
        this._data = data;
        this._lines = lines;
        this._root = root;
        this._alternatePath = alternatePath;
        this.getLocation = this.getLocation.bind(this);
    }
    get data() {
        return this._data;
    }
    getLocation(path, options) {
        const segments = this.pathToSegments(path);
        let node = null;
        while (!node && segments.length > 0) {
            node = (0, jsonc_parser_1.findNodeAtLocation)(this._root, segments) || null;
            segments.pop();
        }
        if (!node && this._alternatePath && path !== this._alternatePath) {
            return this.getLocation(this._alternatePath, options);
        }
        return this.offsetToLocation(this.getAdjustedOffset(node, path, options));
    }
    scope(path) {
        const segments = this.pathToSegments(path);
        const node = (0, jsonc_parser_1.findNodeAtLocation)(this._root, segments);
        const value = this.findValueAtLocation(segments);
        return node ? new JSONResult(value, node, this._lines) : null;
    }
    getAdjustedOffset(node, path, options) {
        if (!node) {
            return this._root.offset;
        }
        if (options && options.at === 'value') {
            return node.offset;
        }
        if (path.match(/(\d|\])$/)) {
            return node.offset;
        }
        if (!node.parent) {
            return node.offset;
        }
        return node.parent.offset + 1;
    }
    findValueAtLocation(segments) {
        let value = this._data;
        segments.forEach((segment) => {
            value = value[segment];
        });
        return value;
    }
    offsetToLocation(offset) {
        for (let i = 0, n = 0; i < this._lines.length; i++) {
            const lineLength = this._lines[i].length;
            if (offset <= n + lineLength) {
                return {
                    column: offset - n,
                    line: i
                };
            }
            n += lineLength + 1;
        }
        return null;
    }
    pathToSegments(path) {
        return path
            .replace(/^\./, '')
            .replace(/^\//, '')
            .replace(/\/(\d+)(\.|$)/, '[$1]$2')
            .replace(/\/(\w+)/, '.$1')
            .replace(/]/g, '')
            .split(/[[.]/)
            .map((k) => {
            return rxIsNumber.test(k) ? parseInt(k) : k;
        });
    }
}
const parseJSON = (json, alternatePath) => {
    const lines = json.split('\n');
    const data = (0, jsonc_parser_1.parse)(json);
    const root = (0, jsonc_parser_1.parseTree)(json);
    if (!root) {
        JSON.parse(json);
    }
    return new JSONResult(data, root, lines, alternatePath);
};
exports.parseJSON = parseJSON;
