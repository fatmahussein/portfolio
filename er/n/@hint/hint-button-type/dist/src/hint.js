"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class ButtonTypeHint {
    constructor(context) {
        const inAForm = (element) => {
            const parent = element.parentElement;
            if (!parent) {
                return false;
            }
            if (parent.nodeName === 'FORM') {
                return true;
            }
            return inAForm(parent);
        };
        const validateElement = (elementFound) => {
            const { resource } = elementFound;
            const allowedTypes = ['submit', 'reset', 'button'];
            debug('Validating hint button-type');
            const element = elementFound.element;
            const elementType = element.getAttribute('type');
            if (element.isAttributeAnExpression('type')) {
                return;
            }
            if (!element.hasAttribute('type') && element.hasAttributeSpread()) {
                return;
            }
            if (elementType === null || elementType === '') {
                const severity = inAForm(element) ?
                    utils_types_1.Severity.warning :
                    utils_types_1.Severity.hint;
                context.report(resource, (0, i18n_import_1.getMessage)('attributeNotSet', context.language), { element, severity });
            }
            else if (!allowedTypes.includes(elementType.toLowerCase())) {
                context.report(resource, (0, i18n_import_1.getMessage)('invalidType', context.language), { element, severity: utils_types_1.Severity.error });
            }
        };
        context.on('element::button', validateElement);
    }
}
exports.default = ButtonTypeHint;
ButtonTypeHint.meta = meta_1.default;
