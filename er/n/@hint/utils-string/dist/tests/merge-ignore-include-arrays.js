"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src");
const headers = {
    'header-1': 'value-1',
    'header-2': 'value-2',
    'header-3': 'value-3',
    'header-4': 'value-4'
};
const headersArray = Object.keys(headers);
(0, ava_1.default)('mergeIgnoreIncludeArrays - new headers are included', (t) => {
    const included = ['header-4', 'header-5'];
    const includedHeaders = (0, src_1.mergeIgnoreIncludeArrays)(headersArray, undefined, included);
    t.deepEqual(includedHeaders, ['header-1', 'header-2', 'header-3', 'header-4', 'header-5']);
});
(0, ava_1.default)('mergeIgnoreIncludeArrays - headers are excluded', (t) => {
    const excluded = ['header-1', 'header-2'];
    const includedHeaders = (0, src_1.mergeIgnoreIncludeArrays)(headersArray, excluded);
    t.deepEqual(includedHeaders, ['header-3', 'header-4']);
});
(0, ava_1.default)('mergeIgnoreIncludeArrays - some included, some excluded', (t) => {
    const included = ['header-5', 'header-6'];
    const excluded = ['header-1', 'header-2'];
    const includedHeaders = (0, src_1.mergeIgnoreIncludeArrays)(headersArray, excluded, included);
    t.deepEqual(includedHeaders, ['header-3', 'header-4', 'header-5', 'header-6']);
});
