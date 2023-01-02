"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFileAsync = void 0;
const fs_1 = require("fs");
const util_1 = require("util");
const writeFileAsync = async (filePath, data) => {
    await (0, util_1.promisify)(fs_1.writeFile)(filePath, data, { encoding: 'utf8' });
};
exports.writeFileAsync = writeFileAsync;
