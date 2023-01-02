"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const os_1 = require("os");
const ava_1 = require("ava");
const src_1 = require("../src");
(0, ava_1.default)('asPathString returns the path name of an "http://" URL', (t) => {
    const url = new url_1.URL('https://myresource.com/my/path');
    const expected = '/my/path';
    const actual = (0, src_1.asPathString)(url);
    t.is(actual, expected, `asPathString doesn't return the path name of an http:// URL`);
});
(0, ava_1.default)('asPathString returns the encoded path name of an "https://" URL', (t) => {
    const url = new url_1.URL('https://myresource.com/my/path/%5B-dont-%20-decode-%5D');
    const expected = '/my/path/%5B-dont-%20-decode-%5D';
    const actual = (0, src_1.asPathString)(url);
    t.is(actual, expected, `asPathString doesn't return the encoded path name of an https:// URL`);
});
(0, ava_1.default)('asPathString returns the decoded path name of an "file://" URL', (t) => {
    const url = (0, os_1.platform)() === 'win32' ?
        new url_1.URL(`file://c:/my/path/%5Bdecode%20me%5D`) :
        new url_1.URL(`file:///my/path/%5Bdecode%20me%5D`);
    const expected = (0, os_1.platform)() === 'win32' ?
        'c:/my/path/[decode me]' :
        '/my/path/[decode me]';
    const actual = (0, src_1.asPathString)(url);
    t.is(actual, expected, `asPathString doesn't return the decoded path name of a file:// URL`);
});
(0, ava_1.default)('asPathString returns the path name of of a file:// URL', (t) => {
    const expected = (0, os_1.platform)() === 'win32' ?
        'c:/my/path' :
        '/my/path';
    const url = (0, os_1.platform)() === 'win32' ?
        new url_1.URL(`file:///c:/my/path`) :
        new url_1.URL(`file:///my/path`);
    const actual = (0, src_1.asPathString)(url);
    t.is(actual, expected, `asPathString doesn't return the path name of a file:// URL`);
});
