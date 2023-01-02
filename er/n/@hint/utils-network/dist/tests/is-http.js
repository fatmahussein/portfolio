"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src");
(0, ava_1.default)('isHTTP detects if the URL is HTTP or not', (t) => {
    const noHttpUri = 'https://myresource.com/';
    const httpUri = 'http://somethinghere';
    t.false((0, src_1.isHTTP)(noHttpUri), `isHTTP doesn't detect correctly ${noHttpUri} is not a HTTP URI`);
    t.true((0, src_1.isHTTP)(httpUri), `isHTTP doesn't detect correctly ${httpUri} is a HTTP URI`);
});
