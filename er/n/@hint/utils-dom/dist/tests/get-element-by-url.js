"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src/");
(0, ava_1.default)('Find by URL match (no match)', (t) => {
    const dom = (0, src_1.createHTMLDocument)(`
        <img src="test1.png">
    `, 'http://example.com/index.html');
    const element = (0, src_1.getElementByUrl)(dom, 'http://example.com/test2.png');
    t.is(element, null);
});
(0, ava_1.default)('Find by URL match (no match, different origin)', (t) => {
    const dom = (0, src_1.createHTMLDocument)(`
        <img src="test.png">
    `, 'http://example.com/index.html');
    const element = (0, src_1.getElementByUrl)(dom, 'http://example2.com/test.png');
    t.is(element, null);
});
(0, ava_1.default)('Find by URL match (relative src)', (t) => {
    const url = 'test.png';
    const dom = (0, src_1.createHTMLDocument)(`
        <img src="${url}">
    `, 'http://example.com/index.html');
    const element = (0, src_1.getElementByUrl)(dom, `http://example.com/${url}`);
    t.not(element, null);
    t.is(element.getAttribute('src'), url);
});
(0, ava_1.default)('Find by URL match (relative srcset)', (t) => {
    const url = 'test465.png';
    const dom = (0, src_1.createHTMLDocument)(`
    <picture>
        <source media="(min-width: 650px)" srcset="test650.jpg">
        <source media="(min-width: 465px)" srcset="${url}">
        <img src="test.jpg" alt="Flowers" style="width:auto;">
  </picture>`, 'http://example.com/index.html');
    const element = (0, src_1.getElementByUrl)(dom, `http://example.com/${url}`);
    t.not(element, null);
    t.is(element.getAttribute('srcset'), url);
});
(0, ava_1.default)('Find by URL match (relative subdirectory src)', (t) => {
    const url = '../images/test.png';
    const dom = (0, src_1.createHTMLDocument)(`
        <img src="${url}">
    `, 'http://example.com/pages/test.html');
    const element = (0, src_1.getElementByUrl)(dom, 'http://example.com/images/test.png');
    t.not(element, null);
    t.is(element.getAttribute('src'), url);
});
(0, ava_1.default)('Find by URL match (root relative subdirectory src)', (t) => {
    const url = '/images/test.png';
    const dom = (0, src_1.createHTMLDocument)(`
        <img src="${url}">
    `, 'http://example.com/pages/test.html');
    const element = (0, src_1.getElementByUrl)(dom, `http://example.com${url}`);
    t.not(element, null);
    t.is(element.getAttribute('src'), url);
});
(0, ava_1.default)('Find by URL match (absolute src)', (t) => {
    const url = 'http://example2.com/images/test.png';
    const dom = (0, src_1.createHTMLDocument)(`
        <img src="${url}">
    `, 'http://example.com/index.html');
    const element = (0, src_1.getElementByUrl)(dom, url);
    t.not(element, null);
    t.is(element.getAttribute('src'), url);
});
(0, ava_1.default)('Find by URL match (data-uri src)', (t) => {
    const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    const dom = (0, src_1.createHTMLDocument)(`
        <img src="test.png">
        <img src="${url}">
    `, 'http://example.com/index.html');
    const element = (0, src_1.getElementByUrl)(dom, url);
    t.not(element, null);
    t.is(element.getAttribute('src'), url);
});
