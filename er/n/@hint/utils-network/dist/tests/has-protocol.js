"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src");
(0, ava_1.default)('hasProtocol checks if a URL has uses the given protocol', (t) => {
    const url = 'https://myresource.com/';
    const containsProtocol = (0, src_1.hasProtocol)(url, 'https:');
    const doesnotContainProtocol = (0, src_1.hasProtocol)(url, 'ftp:');
    t.true(containsProtocol, `hasProtocol doesn't detect correctly the protocol https:`);
    t.false(doesnotContainProtocol, `hasProtocol doesn't detect correctly the protocol ftp:`);
});
