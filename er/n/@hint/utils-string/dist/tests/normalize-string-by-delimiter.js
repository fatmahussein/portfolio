"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src");
(0, ava_1.default)(`normalizeStringByDelimiter returns a string replacing everithing that is not a letter or a number by the provided delimiter`, (t) => {
    t.is((0, src_1.normalizeStringByDelimiter)(' test ', '*'), 'test');
    t.is((0, src_1.normalizeStringByDelimiter)(' test test', '-'), 'test-test');
    t.is((0, src_1.normalizeStringByDelimiter)(' te st ', '~'), 'te~st');
});
