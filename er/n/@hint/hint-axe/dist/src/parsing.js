"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axe_1 = require("./util/axe");
const parsing_1 = require("./meta/parsing");
class AxeHint {
    constructor(context) {
        (0, axe_1.register)(context, ['duplicate-id', 'duplicate-id-active', 'duplicate-id-aria', 'marquee'], []);
    }
}
exports.default = AxeHint;
AxeHint.meta = parsing_1.default;
