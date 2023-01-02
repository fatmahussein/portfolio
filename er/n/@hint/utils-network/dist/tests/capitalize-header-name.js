"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src");
(0, ava_1.default)('capitalizeHeaderName should capitalize a header with a simple word', (t) => {
    t.is((0, src_1.capitalizeHeaderName)('vary'), 'Vary');
});
(0, ava_1.default)('capitalizeHeaderName should capitalize a header with a compose word', (t) => {
    t.is((0, src_1.capitalizeHeaderName)('content-type'), 'Content-Type');
});
