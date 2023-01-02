"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const src_1 = require("../src");
(0, ava_1.default)('isRegularProtocol detects if a URI uses HTTP(S) or not', (t) => {
    const httpUri = 'http://myresource.com/';
    const httpsUri = 'https://somethinghere';
    const ftpUri = 'ftp://somethinghere';
    const noProtocol = 'something';
    t.true((0, src_1.isRegularProtocol)(httpUri), `isRegularProtocol doesn't detect correctly ${httpUri} is a HTTP URI`);
    t.true((0, src_1.isRegularProtocol)(httpsUri), `isRegularProtocol doesn't detect correctly ${httpsUri} is a HTTPS URI`);
    t.false((0, src_1.isRegularProtocol)(ftpUri), `isRegularProtocol doesn't detect correctly ${ftpUri} is a FTP URI`);
    t.true((0, src_1.isRegularProtocol)(noProtocol), `isRegularProtocol doesn't detect correctly ${noProtocol} doesn't have a protocol`);
});
