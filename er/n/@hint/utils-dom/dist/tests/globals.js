"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const parse5 = require("parse5");
const htmlparser2Adapter = require("parse5-htmlparser2-tree-adapter");
const src_1 = require("../src");
const globals_1 = require("../src/globals");
const htmldocument_1 = require("../src/htmldocument");
(0, ava_1.default)('getComputedStyle', (t) => {
    const context = {};
    const dom = parse5.parse('<body>Test</body>', {
        sourceCodeLocationInfo: false,
        treeAdapter: htmlparser2Adapter
    });
    const bodyData = dom.children[0].children[1];
    bodyData['x-styles'] = { display: 'none' };
    const doc = new htmldocument_1.HTMLDocument(dom, 'https://localhost');
    (0, globals_1.populateGlobals)(context, doc);
    t.truthy(context.getComputedStyle);
    t.is(context.getComputedStyle(doc.body).getPropertyValue('display'), 'none');
});
(0, ava_1.default)('getBoundingClientRect', (t) => {
    const context = {};
    const dom = parse5.parse('<body>Test</body>', {
        sourceCodeLocationInfo: false,
        treeAdapter: htmlparser2Adapter
    });
    const bodyData = dom.children[0].children[1];
    bodyData['x-rects'] = {
        clientRect: {
            height: 50,
            width: 100,
            x: 10,
            y: 5
        }
    };
    const doc = new htmldocument_1.HTMLDocument(dom, 'https://localhost');
    (0, globals_1.populateGlobals)(context, doc);
    t.truthy(context.getComputedStyle);
    t.is(doc.body.getBoundingClientRect().x, 10);
    t.is(doc.body.getBoundingClientRect().y, 5);
    t.is(doc.body.getBoundingClientRect().width, 100);
    t.is(doc.body.getBoundingClientRect().height, 50);
    t.is(doc.body.getBoundingClientRect().top, 5);
    t.is(doc.body.getBoundingClientRect().left, 10);
    t.is(doc.body.getBoundingClientRect().right, 110);
    t.is(doc.body.getBoundingClientRect().bottom, 55);
});
(0, ava_1.default)('getBoundingClientRect by deafult', (t) => {
    const context = {};
    const dom = parse5.parse('<body>Test</body>', {
        sourceCodeLocationInfo: false,
        treeAdapter: htmlparser2Adapter
    });
    const doc = new htmldocument_1.HTMLDocument(dom, 'https://localhost');
    (0, globals_1.populateGlobals)(context, doc);
    t.truthy(context.getComputedStyle);
    t.is(doc.body.getBoundingClientRect().x, 0);
    t.is(doc.body.getBoundingClientRect().y, 0);
    t.is(doc.body.getBoundingClientRect().width, 0);
    t.is(doc.body.getBoundingClientRect().height, 0);
    t.is(doc.body.getBoundingClientRect().top, 0);
    t.is(doc.body.getBoundingClientRect().left, 0);
    t.is(doc.body.getBoundingClientRect().right, 0);
    t.is(doc.body.getBoundingClientRect().bottom, 0);
});
(0, ava_1.default)('instanceof', (t) => {
    const context = {};
    const doc = (0, src_1.createHTMLDocument)('test', 'http://localhost/');
    (0, globals_1.populateGlobals)(context, doc);
    t.true(context.document instanceof context.HTMLDocument);
    t.true(context.document.body instanceof context.HTMLBodyElement);
    t.true(context.document.body instanceof context.HTMLElement);
});
(0, ava_1.default)('instances', (t) => {
    const context = {};
    const doc = (0, src_1.createHTMLDocument)('test', 'http://localhost/');
    (0, globals_1.populateGlobals)(context, doc);
    t.is(context.document, doc);
    t.is(context.document.defaultView, context);
    t.is(context.window, context);
    t.is(context.self, context);
    t.is(context.top, context);
});
(0, ava_1.default)('existing self', (t) => {
    const context = {};
    const doc = (0, src_1.createHTMLDocument)('test', 'http://localhost/');
    Object.defineProperty(context, 'self', {
        get() {
            return context;
        },
        set(value) {
            throw new Error('Cannot override "self".');
        }
    });
    t.notThrows(() => {
        (0, globals_1.populateGlobals)(context, doc);
    });
});
