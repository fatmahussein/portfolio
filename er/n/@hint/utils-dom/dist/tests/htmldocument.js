"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src");
(0, ava_1.default)('title', (t) => {
    const doc1 = (0, src_1.createHTMLDocument)('test', 'http://localhost/');
    const doc2 = (0, src_1.createHTMLDocument)('<title></title>', 'http://localhost/');
    const doc3 = (0, src_1.createHTMLDocument)('<title>test</title>', 'http://localhost/');
    t.is(doc1.title, '');
    t.is(doc2.title, '');
    t.is(doc3.title, 'test');
});
(0, ava_1.default)('isFragment', (t) => {
    const doc1 = (0, src_1.createHTMLDocument)('<p>test</p>', 'http://localhost/');
    const doc2 = (0, src_1.createHTMLDocument)('<html>test</html>', 'http://localhost/');
    const doc3 = (0, src_1.createHTMLDocument)('<!doctype html>test', 'http://localhost/');
    t.true(doc1.isFragment);
    t.false(doc2.isFragment);
    t.false(doc3.isFragment);
});
(0, ava_1.default)('querySelectorAll', (t) => {
    const doc = (0, src_1.createHTMLDocument)('<div id="d1">div1</div><div id="d2">div2</div>', 'http://localhost/');
    t.is(doc.querySelectorAll('div').length, 2);
    t.is(doc.querySelectorAll('#d1').length, 1);
    t.is(doc.querySelectorAll('#d2').length, 1);
    t.is(doc.querySelectorAll('#d1')[0].textContent, 'div1');
    t.is(doc.querySelectorAll('#d2')[0].textContent, 'div2');
    t.is(doc.querySelectorAll('div')[0], doc.querySelectorAll('#d1')[0]);
    t.is(doc.querySelectorAll('div')[1], doc.querySelectorAll('#d2')[0]);
});
(0, ava_1.default)('querySelector', (t) => {
    var _a;
    const doc = (0, src_1.createHTMLDocument)('<div>div1</div>', 'http://localhost/');
    t.is((_a = doc.querySelector('div')) === null || _a === void 0 ? void 0 : _a.textContent, 'div1');
    t.is(doc.querySelector('not-div'), null);
});
(0, ava_1.default)('do not create required parents in full documents', (t) => {
    var _a, _b;
    const doc = (0, src_1.createHTMLDocument)('<html><li>item</li></html>', 'http://localhost/');
    t.is((_b = (_a = doc.querySelector('li')) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.nodeName, 'BODY');
});
(0, ava_1.default)('create required parents in fragments', (t) => {
    var _a, _b;
    const doc = (0, src_1.createHTMLDocument)('<li>item</li>', 'http://localhost/');
    t.is((_b = (_a = doc.querySelector('li')) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.nodeName, 'UL');
});
(0, ava_1.default)('merge common required parents in fragments', (t) => {
    var _a, _b, _c, _d;
    const doc = (0, src_1.createHTMLDocument)('<dt>term</dt><dd>def</dd>', 'http://localhost/');
    t.is((_b = (_a = doc.querySelector('dt')) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.nodeName, 'DL');
    t.is((_c = doc.querySelector('dt')) === null || _c === void 0 ? void 0 : _c.parentElement, (_d = doc.querySelector('dd')) === null || _d === void 0 ? void 0 : _d.parentElement);
});
(0, ava_1.default)('recursively create required parents in fragments', (t) => {
    var _a, _b, _c, _d;
    const doc = (0, src_1.createHTMLDocument)('<td>item</td>', 'http://localhost/');
    t.is((_b = (_a = doc.querySelector('td')) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.nodeName, 'TR');
    t.is((_d = (_c = doc.querySelector('tr')) === null || _c === void 0 ? void 0 : _c.parentElement) === null || _d === void 0 ? void 0 : _d.nodeName, 'TABLE');
});
