"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const utils_css_1 = require("@hint/utils-css");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
const findParentSVGElement = (element) => {
    if (!element.parentElement) {
        return null;
    }
    if (element.parentElement.nodeName === 'svg') {
        return element.parentElement;
    }
    return findParentSVGElement(element.parentElement);
};
const isOutsideParentSVG = (parentSVG) => {
    return (element) => {
        const elementsParentSVG = findParentSVGElement(element);
        if (!elementsParentSVG) {
            return true;
        }
        if (!elementsParentSVG.isSame(parentSVG)) {
            return true;
        }
        return false;
    };
};
class ScopedSvgStylesHint {
    constructor(context) {
        const formatRuleMessage = (numberOfElementsOutsideSVG) => {
            return (0, i18n_import_1.getMessage)('reportRuleImpacting', context.language, [
                `${numberOfElementsOutsideSVG}`
            ]);
        };
        const formatElementMessage = (codeSnippet) => {
            return (0, i18n_import_1.getMessage)('reportImpactedElement', context.language, [
                codeSnippet
            ]);
        };
        const validateStyle = ({ ast, element, resource }) => {
            if (!element) {
                return;
            }
            const parentSVG = findParentSVGElement(element);
            if (!parentSVG) {
                return;
            }
            debug('Validating hint scoped-svg-styles');
            ast.walkRules((rule) => {
                const selectors = rule.selectors;
                for (const selector of selectors) {
                    const matchingElements = element.ownerDocument.querySelectorAll(selector);
                    const matchingElementsOutsideParentSVG = matchingElements.filter(isOutsideParentSVG(parentSVG));
                    if (matchingElementsOutsideParentSVG.length) {
                        const message = formatRuleMessage(matchingElementsOutsideParentSVG.length);
                        const location = (0, utils_css_1.getCSSLocationFromNode)(rule);
                        const codeSnippet = (0, utils_css_1.getCSSCodeSnippet)(rule);
                        context.report(resource, message, {
                            codeLanguage: 'css',
                            codeSnippet,
                            element,
                            location,
                            severity: utils_types_1.Severity.error
                        });
                        let maxReportsPerCSSRule = Infinity;
                        if (context.hintOptions && context.hintOptions.maxReportsPerCSSRule !== undefined) {
                            maxReportsPerCSSRule = context.hintOptions.maxReportsPerCSSRule;
                        }
                        for (let i = 0; (i < matchingElementsOutsideParentSVG.length && i < maxReportsPerCSSRule); i++) {
                            context.report(resource, formatElementMessage(codeSnippet), {
                                element: matchingElementsOutsideParentSVG[i],
                                severity: utils_types_1.Severity.error
                            });
                        }
                    }
                }
            });
        };
        context.on('parse::end::css', validateStyle);
    }
}
exports.default = ScopedSvgStylesHint;
ScopedSvgStylesHint.meta = meta_1.default;
