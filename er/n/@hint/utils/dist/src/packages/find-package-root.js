"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPackageRoot = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const findPackageRoot = (dirname = __dirname, fileToFind = 'package.json') => {
    const content = (0, fs_1.readdirSync)(dirname);
    if (content.includes(fileToFind)) {
        return dirname;
    }
    const parentFolder = (0, path_1.resolve)(dirname, '..');
    if (parentFolder === dirname) {
        throw new Error('No package found');
    }
    return (0, exports.findPackageRoot)(parentFolder, fileToFind);
};
exports.findPackageRoot = findPackageRoot;
