"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathExists = void 0;
const fs_1 = require("fs");
const pathExists = (pathString) => {
    try {
        const stats = (0, fs_1.statSync)(pathString);
        return stats.isDirectory();
    }
    catch (e) {
        return false;
    }
};
exports.pathExists = pathExists;
