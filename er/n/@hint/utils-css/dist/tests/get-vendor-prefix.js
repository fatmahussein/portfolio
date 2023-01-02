"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const get_vendor_prefix_1 = require("../src/get-vendor-prefix");
const ava_1 = require("ava");
(0, ava_1.default)(`Returns vendor prefix`, (t) => {
    const expected = '-moz-';
    t.is((0, get_vendor_prefix_1.getVendorPrefix)('-moz-animation'), expected);
});
