"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src");
(0, ava_1.default)('childNodes', (t) => {
    const doc = (0, src_1.createHTMLDocument)('<body>1<div></div>2</body>', 'http://localhost/');
    t.is(doc.childNodes.length, 1);
    t.is(doc.body.childNodes.length, 3);
    t.is(doc.body.childNodes[1].childNodes.length, 0);
});
(0, ava_1.default)('contains', (t) => {
    const doc = (0, src_1.createHTMLDocument)('<body>1<div></div>2</body>', 'http://localhost/');
    t.is(doc.contains(doc.body), true);
    t.is(doc.contains(doc.body.childNodes[1]), true);
    t.is(doc.body.contains(doc.body.childNodes[1]), true);
    t.is(doc.body.contains(doc.body), true);
    t.is(doc.body.childNodes[1].contains(doc.body), false);
    t.is(doc.body.childNodes[1].contains(doc.body.childNodes[0]), false);
});
(0, ava_1.default)('nodeName', (t) => {
    const doc = (0, src_1.createHTMLDocument)('<!doctype html><!--comment--><html><body>text<script>test</script><style>test</style></body></html>', 'http://localhost/');
    t.is(doc.nodeName, '#document');
    t.is(doc.childNodes[0].nodeName, 'html');
    t.is(doc.childNodes[1].nodeName, '#comment');
    t.is(doc.body.nodeName, 'BODY');
    t.is(doc.body.childNodes[0].nodeName, '#text');
    t.is(doc.body.childNodes[1].nodeName, 'SCRIPT');
    t.is(doc.body.childNodes[2].nodeName, 'STYLE');
});
(0, ava_1.default)('nodeType', (t) => {
    const doc = (0, src_1.createHTMLDocument)('<!doctype html><!--comment--><html><body>text</body></html>', 'http://localhost/');
    t.is(doc.nodeType, 9);
    t.is(doc.childNodes[0].nodeType, 10);
    t.is(doc.childNodes[1].nodeType, 8);
    t.is(doc.body.nodeType, 1);
    t.is(doc.body.childNodes[0].nodeType, 3);
});
(0, ava_1.default)('nodeValue', (t) => {
    const doc = (0, src_1.createHTMLDocument)('<!doctype html><!--comment--><html><body>text</body></html>', 'http://localhost/');
    t.is(doc.nodeValue, null);
    t.is(doc.childNodes[0].nodeValue, null);
    t.is(doc.childNodes[1].nodeValue, 'comment');
    t.is(doc.body.nodeValue, null);
    t.is(doc.body.childNodes[0].nodeValue, 'text');
});
(0, ava_1.default)('parentElement', (t) => {
    const doc = (0, src_1.createHTMLDocument)('<div></div>', 'http://localhost/');
    t.is(doc.documentElement.parentElement, null);
    t.is(doc.body.parentElement, doc.documentElement);
    t.is(doc.body.childNodes[0].parentElement, doc.body);
});
(0, ava_1.default)('parentNode', (t) => {
    const doc = (0, src_1.createHTMLDocument)('<body>test</body>', 'http://localhost/');
    t.is(doc.parentNode, null);
    t.is(doc.documentElement.parentNode, doc);
    t.is(doc.body.parentNode, doc.documentElement);
    t.is(doc.body.childNodes[0].parentNode, doc.body);
});
(0, ava_1.default)('textContent', (t) => {
    const doc = (0, src_1.createHTMLDocument)('<div>1<div>2</div>3</div>', 'http://localhost/');
    t.is(doc.documentElement.textContent, '123');
});
