"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOriginalElement = void 0;
const utils_debug_1 = require("@hint/utils-debug");
const debug = (0, utils_debug_1.debug)(__filename);
const findMatches = (document, query, test) => {
    let matches = [];
    try {
        matches = document.querySelectorAll(query);
    }
    catch (e) {
        debug(`Selector is invalid (${query}): ${e.message}`);
    }
    if (test) {
        matches = matches.filter((match) => {
            return test(match);
        });
    }
    return matches;
};
const findMatch = (document, element, query, test) => {
    const matches = findMatches(document, query, test);
    let matchIndex = 0;
    if (matches.length > 1) {
        const ownerMatches = findMatches(element.ownerDocument, query, test);
        matchIndex = ownerMatches.findIndex((match) => {
            return match.isSame(element);
        });
    }
    return matches[matchIndex] || null;
};
const findOriginalElement = (document, element) => {
    const name = element.nodeName.toLowerCase();
    for (const attribute of ['id', 'name', 'data', 'href', 'src', 'srcset', 'charset']) {
        const value = element.getAttribute(attribute);
        if (value) {
            return findMatch(document, element, `${name}[${attribute}="${value}"]`);
        }
    }
    if (['base', 'body', 'head', 'html', 'title'].includes(name)) {
        return findMatch(document, element, name);
    }
    if (['audio', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'script', 'style', 'video'].includes(name)) {
        return findMatch(document, element, name, (potentialMatch) => {
            return potentialMatch.innerHTML === element.innerHTML;
        });
    }
    const firstClass = (element.getAttribute('class') || '').split(' ')[0];
    if (firstClass) {
        return findMatch(document, element, `${name}.${firstClass}`);
    }
    return findMatch(document, element, name);
};
exports.findOriginalElement = findOriginalElement;
