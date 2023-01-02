"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axe_1 = require("./util/axe");
const text_alternatives_1 = require("./meta/text-alternatives");
class AxeHint {
    constructor(context) {
        (0, axe_1.register)(context, ['area-alt', 'document-title', 'frame-title', 'frame-title-unique', 'image-alt', 'image-redundant-alt', 'input-image-alt', 'object-alt', 'role-img-alt', 'server-side-image-map', 'svg-img-alt', 'video-caption'], ['frame-title-unique', 'image-redundant-alt', 'svg-img-alt']);
    }
}
exports.default = AxeHint;
AxeHint.meta = text_alternatives_1.default;
