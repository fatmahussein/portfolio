"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeParse = void 0;
const url_1 = require("url");
const vm = require("vm");
const path = require("path");
const jsdomutils = require("jsdom/lib/jsdom/living/generated/utils");
const utils_fs_1 = require("@hint/utils-fs");
const beforeParse = (finalHref) => {
    return (window) => {
        const mutationObserverPolyfill = (0, utils_fs_1.readFile)(require.resolve('mutationobserver-shim'));
        const customElementsPolyfill = (0, utils_fs_1.readFile)(path.join(__dirname, 'polyfills', 'custom-elements.min.js'));
        const mutationScript = new vm.Script(mutationObserverPolyfill);
        const customElementsScript = new vm.Script(customElementsPolyfill);
        mutationScript.runInContext(jsdomutils.implForWrapper(window.document)._global);
        customElementsScript.runInContext(jsdomutils.implForWrapper(window.document)._global);
        window.document.domain = new url_1.URL(finalHref).host;
        window.matchMedia = () => {
            return { addListener() { } };
        };
        Object.defineProperty(window.HTMLHtmlElement.prototype, 'clientWidth', { value: 1024 });
        Object.defineProperty(window.HTMLHtmlElement.prototype, 'clientHeight', { value: 768 });
    };
};
exports.beforeParse = beforeParse;
