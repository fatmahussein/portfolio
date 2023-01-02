"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axe_1 = require("./util/axe");
const semantics_1 = require("./meta/semantics");
class AxeHint {
    constructor(context) {
        (0, axe_1.register)(context, ['heading-order', 'identical-links-same-purpose', 'label-content-name-mismatch', 'landmark-banner-is-top-level', 'landmark-complementary-is-top-level', 'landmark-contentinfo-is-top-level', 'landmark-main-is-top-level', 'landmark-no-duplicate-banner', 'landmark-no-duplicate-contentinfo', 'landmark-no-duplicate-main', 'landmark-one-main', 'landmark-unique', 'p-as-heading', 'page-has-heading-one'], ['heading-order', 'label-content-name-mismatch', 'landmark-banner-is-top-level', 'landmark-complementary-is-top-level', 'landmark-contentinfo-is-top-level', 'landmark-main-is-top-level', 'landmark-no-duplicate-banner', 'landmark-no-duplicate-contentinfo', 'landmark-no-duplicate-main', 'landmark-one-main', 'landmark-unique', 'p-as-heading', 'page-has-heading-one']);
    }
}
exports.default = AxeHint;
AxeHint.meta = semantics_1.default;
