"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axe_1 = require("./util/axe");
const name_role_value_1 = require("./meta/name-role-value");
class AxeHint {
    constructor(context) {
        (0, axe_1.register)(context, ['aria-hidden-focus', 'button-name', 'empty-heading', 'input-button-name', 'link-name'], ['empty-heading']);
    }
}
exports.default = AxeHint;
AxeHint.meta = name_role_value_1.default;
