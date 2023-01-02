"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFile = void 0;
const fs_1 = require("fs");
const readFile = (filePath) => {
    const content = (0, fs_1.readFileSync)(filePath, 'utf8');
    if (content[0] === '\uFEFF') {
        return content.substr(1);
    }
    return content;
};
exports.readFile = readFile;
