"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src");
(0, ava_1.default)(`cutString returns a string if it's smaller than the threshold`, (t) => {
    const source = 'this-is-a-string';
    const transformed = (0, src_1.cutString)(source);
    t.is(transformed, source, `${transformed} !== ${source}`);
});
(0, ava_1.default)(`cutString cuts the string and adds "…" if it is bigger than the threshold`, (t) => {
    const source = 'this-is-a-string';
    const expected = 'thi … ring';
    const transformed = (0, src_1.cutString)(source, 10);
    t.is(transformed, expected, `${transformed} !== ${expected}`);
});
