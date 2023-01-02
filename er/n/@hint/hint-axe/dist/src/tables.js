"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axe_1 = require("./util/axe");
const tables_1 = require("./meta/tables");
class AxeHint {
    constructor(context) {
        (0, axe_1.register)(context, ['scope-attr-valid', 'table-duplicate-name', 'table-fake-caption', 'td-has-header', 'td-headers-attr', 'th-has-data-cells'], ['scope-attr-valid', 'table-duplicate-name', 'table-fake-caption', 'td-has-header']);
    }
}
exports.default = AxeHint;
AxeHint.meta = tables_1.default;
