"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFileAsync = void 0;
const util_1 = require("util");
const fs_1 = require("fs");
const readFileAsync = async (filePath) => {
    if (typeof __webpack_require__ !== 'undefined' && typeof filePath === 'number') {
        return __webpack_require__(filePath);
    }
    const content = await (0, util_1.promisify)(fs_1.readFile)(filePath, 'utf8');
    if (content[0] === '\uFEFF') {
        return content.substr(1);
    }
    return content;
};
exports.readFileAsync = readFileAsync;
