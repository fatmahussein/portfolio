"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileName = void 0;
const path_1 = require("path");
const fileName = (resource) => {
    return (0, path_1.basename)(resource);
};
exports.fileName = fileName;
