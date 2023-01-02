"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_compat_data_1 = require("@hint/utils-compat-data");
const utils_types_1 = require("@hint/utils-types");
const browsers_1 = require("./utils/browsers");
const ignore_1 = require("./utils/ignore");
const html_1 = require("./meta/html");
const i18n_import_1 = require("./i18n.import");
const validateAttributeValue = (element, attr, context) => {
    if (context.ignore.has(`${element}[${attr.name}=${attr.value}]`)) {
        return;
    }
    const unsupported = (0, utils_compat_data_1.getUnsupportedDetails)({ attribute: attr.name, element, value: attr.value }, context.browsers);
    if (unsupported) {
        context.report({ feature: `${element}[${attr.name}=${attr.value}]`, unsupported });
    }
};
const validateAttribute = (element, attr, context) => {
    if (context.ignore.has(attr.name) || context.ignore.has(`${element}[${attr.name}]`)) {
        return;
    }
    const unsupported = (0, utils_compat_data_1.getUnsupportedDetails)({ attribute: attr.name, element }, context.browsers);
    if (unsupported) {
        context.report({ feature: `${element}[${attr.name}]`, unsupported });
    }
    else {
        validateAttributeValue(element, attr, context);
    }
};
const validateElement = (node, context) => {
    const element = node.nodeName.toLowerCase();
    if (context.ignore.has(element)) {
        return;
    }
    const unsupported = (0, utils_compat_data_1.getUnsupportedDetails)({ element }, context.browsers);
    if (unsupported) {
        context.report({ feature: element, unsupported });
    }
    else {
        for (let i = 0; i < node.attributes.length; i++) {
            validateAttribute(element, node.attributes[i], context);
        }
    }
};
class HTMLCompatHint {
    constructor(context) {
        const ignore = (0, ignore_1.resolveIgnore)([
            'a[rel=noopener]',
            'autocomplete',
            'crossorigin',
            'input[inputmode]',
            'integrity',
            'link[rel]',
            'main',
            'spellcheck'
        ], context.hintOptions);
        context.on('element::*', ({ element, resource }) => {
            const browsers = (0, browsers_1.filterBrowsers)(context.targetedBrowsers);
            const report = ({ feature, unsupported }) => {
                const message = (0, i18n_import_1.getMessage)('featureNotSupported', context.language, [feature, (0, browsers_1.joinBrowsers)(unsupported)]);
                const documentation = unsupported.mdnUrl ? [{
                        link: unsupported.mdnUrl,
                        text: (0, i18n_import_1.getMessage)('learnMoreHTML', context.language)
                    }] : undefined;
                context.report(resource, message, {
                    browsers: unsupported.browsers,
                    documentation,
                    element,
                    severity: utils_types_1.Severity.warning
                });
            };
            validateElement(element, { browsers, ignore, report });
        });
    }
}
exports.default = HTMLCompatHint;
HTMLCompatHint.meta = html_1.default;
