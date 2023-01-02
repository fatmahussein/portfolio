"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axe_1 = require("./util/axe");
const time_and_media_1 = require("./meta/time-and-media");
class AxeHint {
    constructor(context) {
        (0, axe_1.register)(context, ['audio-caption', 'blink', 'meta-refresh', 'no-autoplay-audio'], ['no-autoplay-audio']);
    }
}
exports.default = AxeHint;
AxeHint.meta = time_and_media_1.default;
