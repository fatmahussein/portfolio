"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axe_1 = require("./util/axe");
const language_1 = require("./meta/language");
class AxeHint {
    constructor(context) {
        (0, axe_1.register)(context, ['html-has-lang', 'html-lang-valid', 'html-xml-lang-mismatch', 'valid-lang'], []);
    }
}
exports.default = AxeHint;
AxeHint.meta = language_1.default;
