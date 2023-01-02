"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src");
(0, ava_1.default)('isDataUri detects if the URL is a data URI or not', (t) => {
    const noDataUri = 'https://myresource.com/';
    const dataUri = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D';
    t.false((0, src_1.isDataURI)(noDataUri), `isDataUri doesn't detect correctly ${noDataUri} is not a data URI`);
    t.true((0, src_1.isDataURI)(dataUri), `isDataUri doesn't detect correctly ${dataUri} is a data URI`);
});
