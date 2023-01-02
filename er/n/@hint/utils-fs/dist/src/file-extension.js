"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileExtension = void 0;
const path_1 = require("path");
const url_1 = require("url");
const fileExtension = (resource) => {
    let url;
    try {
        url = new url_1.URL(resource, 'http://example.com');
    }
    catch (err) {
        return (0, path_1.extname)(resource).split('.')
            .pop() || '';
    }
    return (0, path_1.extname)(url.pathname).split('.')
        .pop() || '';
};
exports.fileExtension = fileExtension;
