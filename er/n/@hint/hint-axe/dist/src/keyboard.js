"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axe_1 = require("./util/axe");
const keyboard_1 = require("./meta/keyboard");
class AxeHint {
    constructor(context) {
        (0, axe_1.register)(context, ['accesskeys', 'bypass', 'focus-order-semantics', 'frame-focusable-content', 'nested-interactive', 'region', 'scrollable-region-focusable', 'skip-link', 'tabindex'], ['accesskeys', 'focus-order-semantics', 'region', 'skip-link', 'tabindex']);
    }
}
exports.default = AxeHint;
AxeHint.meta = keyboard_1.default;
