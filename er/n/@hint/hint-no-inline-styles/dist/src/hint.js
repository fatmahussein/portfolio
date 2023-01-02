"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const utils_debug_1 = require("@hint/utils-debug");
const debug = (0, utils_debug_1.debug)(__filename);
class NoInlineStylesHint {
    constructor(context) {
        let requireNoStyleElement = false;
        const validate = ({ document, resource }) => {
            const styleElements = document.querySelectorAll('style');
            const severity = utils_types_1.Severity.warning;
            debug(`Validating rule no-inline-styles`);
            if (requireNoStyleElement) {
                styleElements.forEach((element) => {
                    context.report(resource, (0, i18n_import_1.getMessage)('styleElementFound', context.language), { element, severity });
                });
            }
            const elementsWithStyleAttribute = document.querySelectorAll('[style]');
            elementsWithStyleAttribute.forEach((element) => {
                context.report(resource, (0, i18n_import_1.getMessage)('elementsWithStyleAttributeFound', context.language), { element, severity });
            });
        };
        const loadHintConfigs = () => {
            requireNoStyleElement =
                (context.hintOptions &&
                    context.hintOptions.requireNoStyleElement) ||
                    false;
        };
        loadHintConfigs();
        context.on('parse::end::html', validate);
    }
}
exports.default = NoInlineStylesHint;
NoInlineStylesHint.meta = meta_1.default;
