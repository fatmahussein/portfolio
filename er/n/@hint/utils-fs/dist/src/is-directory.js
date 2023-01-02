"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDirectory = void 0;
const fs_1 = require("fs");
const isDirectory = (directoryPath) => {
    try {
        const stat = (0, fs_1.statSync)(directoryPath);
        return stat.isDirectory();
    }
    catch (e) {
        return false;
    }
};
exports.isDirectory = isDirectory;
