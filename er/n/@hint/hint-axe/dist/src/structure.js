"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axe_1 = require("./util/axe");
const structure_1 = require("./meta/structure");
class AxeHint {
    constructor(context) {
        (0, axe_1.register)(context, ['avoid-inline-spacing', 'css-orientation-lock', 'definition-list', 'dlitem', 'frame-tested', 'hidden-content', 'list', 'listitem'], ['css-orientation-lock', 'frame-tested', 'hidden-content']);
    }
}
exports.default = AxeHint;
AxeHint.meta = structure_1.default;
