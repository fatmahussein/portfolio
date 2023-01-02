"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFile = void 0;
const fs_1 = require("fs");
const isFile = (filePath) => {
    try {
        const stats = (0, fs_1.statSync)(filePath);
        return stats.isFile();
    }
    catch (e) {
        return false;
    }
};
exports.isFile = isFile;
