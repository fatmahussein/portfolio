"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axe_1 = require("./util/axe");
const sensory_and_visual_cues_1 = require("./meta/sensory-and-visual-cues");
class AxeHint {
    constructor(context) {
        (0, axe_1.register)(context, ['meta-viewport', 'meta-viewport-large'], ['meta-viewport', 'meta-viewport-large']);
    }
}
exports.default = AxeHint;
AxeHint.meta = sensory_and_visual_cues_1.default;
