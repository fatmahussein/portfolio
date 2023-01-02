"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src");
(0, ava_1.default)('getAsUri returns a URI for `http` protocol', (t) => {
    const uri = (0, src_1.getAsUri)('http://www.bing.com/');
    t.is(uri && uri.protocol, 'http:', `getAsUri didn't return a URI with the HTTP protocol`);
});
(0, ava_1.default)('getAsUri returns a URI for `https` protocol', (t) => {
    const uri = (0, src_1.getAsUri)('https://www.bing.com/');
    t.is(uri && uri.protocol, 'https:', `getAsUri didn't return a URI with the HTTPS protocol`);
});
(0, ava_1.default)('getAsUri returns a URI for `file` protocol', (t) => {
    const uri = (0, src_1.getAsUri)('file://fixtures/empty.txt');
    t.is(uri && uri.protocol, 'file:', `getAsUri didn't return a URI with the file protocol`);
});
(0, ava_1.default)('getAsUri returns a URI for a local file without a protocol', (t) => {
    const uri = (0, src_1.getAsUri)(`${__dirname}/fixtures/empty.txt`);
    t.is(uri && uri.protocol, 'file:', `getAsUri didn't return a URI for a local file`);
});
(0, ava_1.default)('getAsUri returns a URI for localhost', (t) => {
    const uri = (0, src_1.getAsUri)('localhost/test.html');
    t.is(uri && uri.protocol, 'http:', `getAsUri didn't return a URI for localhost`);
});
(0, ava_1.default)('getAsUri returns `null` for invalid sources', (t) => {
    const uri = (0, src_1.getAsUri)('invalid');
    t.is(uri, null, `getAsUri returned a URI for an invalid source`);
});
(0, ava_1.default)('getAsUris drops invalid URLs', (t) => {
    const uris = (0, src_1.getAsUris)(['localhost', 'invalid']);
    t.is(uris.length, 1, `getAsUris didn't return the expected number of URIs`);
});
(0, ava_1.default)('getAsUri resolves relative file paths', (t) => {
    const uri = (0, src_1.getAsUri)('.');
    t.is(uri === null || uri === void 0 ? void 0 : uri.hostname, '', `getAsUri didn't resolve relative path to an absolute path`);
});
