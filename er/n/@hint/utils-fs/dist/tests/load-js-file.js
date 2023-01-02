"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const ava_1 = require("ava");
const src_1 = require("../src");
const resolve = (route) => {
    return (0, path_1.join)(__dirname, route);
};
(0, ava_1.default)('loadJSFile throws an exception if missing file', (t) => {
    t.throws(() => {
        (0, src_1.loadJSFile)(resolve('./fixtures/dontexists.js'));
    });
});
(0, ava_1.default)('loadJSFile throws an exception if invalid JS or JSON file', (t) => {
    t.throws(() => {
        (0, src_1.loadJSFile)(resolve('./fixtures/dummy.txt'));
    });
});
(0, ava_1.default)('loadJSFile loads a valid JS module', (t) => {
    try {
        const a = (0, src_1.loadJSFile)(resolve('./fixtures/fixture.js'));
        t.is(a.property1, 'value1');
    }
    catch (e) {
        t.fail('Throws unexpected exception');
    }
});
