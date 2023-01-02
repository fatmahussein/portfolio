"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src");
(0, ava_1.default)('isLocalhost detects localhost URLs', (t) => {
    t.true(src_1.rxLocalhost.test('http://localhost/foo/bar'));
});
(0, ava_1.default)('isLocalhost ignores public URLs', (t) => {
    t.false(src_1.rxLocalhost.test('http://bing.com/foo/bar'));
});
(0, ava_1.default)('isLocalhost ignores localhost sub-domains', (t) => {
    t.false(src_1.rxLocalhost.test('http://localhost.foo.com/foo/bar'));
});
(0, ava_1.default)('isLocalhost detects loopback URLs', (t) => {
    t.true(src_1.rxLocalhost.test('http://127.0.0.1/foo/bar'));
});
(0, ava_1.default)('isLocalhost ignores other IP-based URLs', (t) => {
    t.false(src_1.rxLocalhost.test('http://198.0.0.1/foo/bar'));
});
(0, ava_1.default)('isLocalhost detects HTTPS localhost URLs', (t) => {
    t.true(src_1.rxLocalhost.test('https://localhost/foo/bar'));
});
(0, ava_1.default)('isLocalhost detects localhost URLs with port', (t) => {
    t.true(src_1.rxLocalhost.test('http://localhost:8080/foo/bar'));
});
