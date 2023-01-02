"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src");
(0, ava_1.default)('isHTTPS detects if the URL is HTTP or not', (t) => {
    const noHttpsUri = 'http://myresource.com/';
    const httpsUri = 'https://somethinghere';
    t.false((0, src_1.isHTTPS)(noHttpsUri), `isHTTPS doesn't detect correctly ${noHttpsUri} is not a HTTPS URI`);
    t.true((0, src_1.isHTTPS)(httpsUri), `isHTTPS doesn't detect correctly ${httpsUri} is a HTTPS URI`);
});
