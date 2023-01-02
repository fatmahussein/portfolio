"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axe_1 = require("./util/axe");
const forms_1 = require("./meta/forms");
class AxeHint {
    constructor(context) {
        (0, axe_1.register)(context, ['autocomplete-valid', 'form-field-multiple-labels', 'label', 'label-title-only', 'select-name'], ['label-title-only']);
    }
}
exports.default = AxeHint;
AxeHint.meta = forms_1.default;
