"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axe_1 = require("./util/axe");
const aria_1 = require("./meta/aria");
class AxeHint {
    constructor(context) {
        (0, axe_1.register)(context, ['aria-allowed-attr', 'aria-allowed-role', 'aria-command-name', 'aria-dialog-name', 'aria-hidden-body', 'aria-input-field-name', 'aria-meter-name', 'aria-progressbar-name', 'aria-required-attr', 'aria-required-children', 'aria-required-parent', 'aria-roledescription', 'aria-roles', 'aria-text', 'aria-toggle-field-name', 'aria-tooltip-name', 'aria-treeitem-name', 'aria-valid-attr', 'aria-valid-attr-value', 'empty-table-header', 'presentation-role-conflict'], ['aria-allowed-role', 'aria-dialog-name', 'aria-text', 'aria-treeitem-name', 'presentation-role-conflict']);
    }
}
exports.default = AxeHint;
AxeHint.meta = aria_1.default;
