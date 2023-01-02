"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metaviewport_parser_1 = require("metaviewport-parser");
const utils_string_1 = require("@hint/utils-string");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
class MetaViewportHint {
    constructor(context) {
        const getViewportMetaElements = (elements) => {
            return elements.filter((element) => {
                return (element.getAttribute('name') !== null && (0, utils_string_1.normalizeString)(element.getAttribute('name')) === 'viewport');
            });
        };
        const listIncludesBrowsersWithOrientationChangeBug = (browsersList) => {
            return browsersList.some((browserVersion) => {
                const version = (/ios_saf (\d+)\.?.*/).exec(browserVersion);
                return version ? parseInt(version[1]) < 9 : false;
            });
        };
        const checkContentValue = (contentValue, resource, viewportMetaElement) => {
            if (!contentValue) {
                const message = (0, i18n_import_1.getMessage)('metaElementNonEmptyContent', context.language);
                context.report(resource, message, {
                    element: viewportMetaElement,
                    severity: utils_types_1.Severity.error
                });
                return;
            }
            const content = (0, metaviewport_parser_1.parseMetaViewPortContent)(contentValue);
            for (const key of Object.keys(content.unknownProperties)) {
                const message = (0, i18n_import_1.getMessage)('metaElementUnknownProperty', context.language, key);
                context.report(resource, message, {
                    element: viewportMetaElement,
                    severity: utils_types_1.Severity.warning
                });
            }
            for (const key of Object.keys(content.invalidValues)) {
                const message = (0, i18n_import_1.getMessage)('metaElementInvalidValues', context.language, key);
                context.report(resource, message, {
                    element: viewportMetaElement,
                    severity: utils_types_1.Severity.error
                });
            }
            for (const key of Object.keys(content.validProperties)) {
                if ([
                    'maximum-scale',
                    'minimum-scale',
                    'user-scalable'
                ].includes(key)) {
                    const message = (0, i18n_import_1.getMessage)('metaElementDisallowedValues', context.language, key);
                    context.report(resource, message, {
                        element: viewportMetaElement,
                        severity: utils_types_1.Severity.error
                    });
                }
            }
            if (content.validProperties.width !== 'device-width') {
                const message = (0, i18n_import_1.getMessage)('metaElementNoDeviceWidth', context.language);
                context.report(resource, message, {
                    element: viewportMetaElement,
                    severity: utils_types_1.Severity.error
                });
            }
            const initialScaleValue = content.validProperties['initial-scale'];
            if ((initialScaleValue !== 1 && typeof initialScaleValue !== 'undefined') ||
                (typeof initialScaleValue === 'undefined' && listIncludesBrowsersWithOrientationChangeBug(context.targetedBrowsers))) {
                const message = (0, i18n_import_1.getMessage)('metaElementNoInitialScale', context.language);
                context.report(resource, message, {
                    element: viewportMetaElement,
                    severity: utils_types_1.Severity.error
                });
            }
        };
        const validate = ({ resource }) => {
            const pageDOM = context.pageDOM;
            if (pageDOM.isFragment) {
                return;
            }
            const viewportMetaElements = getViewportMetaElements(pageDOM.querySelectorAll('meta'));
            if (viewportMetaElements.length === 0) {
                context.report(resource, (0, i18n_import_1.getMessage)('metaElementNotSpecified', context.language), { severity: utils_types_1.Severity.error });
                return;
            }
            const viewportMetaElement = viewportMetaElements[0];
            const bodyMetaElements = getViewportMetaElements(pageDOM.querySelectorAll('body meta'));
            if ((bodyMetaElements.length > 0) && bodyMetaElements[0].isSame(viewportMetaElement)) {
                context.report(resource, (0, i18n_import_1.getMessage)('metaElementInBody', context.language), {
                    element: viewportMetaElement,
                    severity: utils_types_1.Severity.error
                });
            }
            const contentValue = (0, utils_string_1.normalizeString)(viewportMetaElement.getAttribute('content'));
            checkContentValue(contentValue, resource, viewportMetaElement);
            if (viewportMetaElements.length > 1) {
                const metaElements = viewportMetaElements.slice(1);
                for (const metaElement of metaElements) {
                    context.report(resource, (0, i18n_import_1.getMessage)('metaElementDuplicated', context.language), {
                        element: metaElement,
                        severity: utils_types_1.Severity.warning
                    });
                }
            }
        };
        context.on('traverse::end', validate);
    }
}
exports.default = MetaViewportHint;
MetaViewportHint.meta = meta_1.default;
