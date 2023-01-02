"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const ava_1 = require("ava");
const src_1 = require("../src");
const html = fs.readFileSync(path.join(__dirname, 'fixtures', 'html-report.html'), 'utf-8');
const htmlDocument = (0, src_1.createHTMLDocument)(html, 'http://example.com');
(0, ava_1.default)('If opening tag is bigger than threshold, nothing happend', (t) => {
    const element = htmlDocument.querySelectorAll('meta')[0];
    t.is((0, src_1.getHTMLCodeSnippet)(element), element.outerHTML);
});
(0, ava_1.default)('If element is to big, return just the opening tag', (t) => {
    const element = htmlDocument.querySelectorAll('.container')[0];
    t.is((0, src_1.getHTMLCodeSnippet)(element), '<div class="container">');
});
(0, ava_1.default)('If element is big, but the threshold too, it will return the outerHTML', (t) => {
    const element = htmlDocument.querySelectorAll('.container')[0];
    const outerHTML = element.outerHTML;
    t.is((0, src_1.getHTMLCodeSnippet)(element, outerHTML.length), outerHTML);
});
