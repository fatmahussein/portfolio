"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
class StylesheetLimitsHint {
    constructor(context) {
        const options = context.hintOptions;
        const includesOldIE = ['ie 6', 'ie 7', 'ie 8', 'ie 9'].some((e) => {
            return context.targetedBrowsers.includes(e);
        });
        if (!options && !includesOldIE) {
            return;
        }
        let hasImportLimit = includesOldIE;
        let hasRuleLimit = includesOldIE;
        let hasSheetLimit = includesOldIE;
        let maxImports = includesOldIE ? 4 : 0;
        let maxRules = includesOldIE ? 4095 : 0;
        let maxSheets = includesOldIE ? 31 : 0;
        if (options) {
            if (options.maxImports && (!hasImportLimit || options.maxImports < maxImports)) {
                maxImports = options.maxImports;
                hasImportLimit = true;
            }
            if (options.maxRules && (!hasRuleLimit || options.maxRules < maxRules)) {
                maxRules = options.maxRules;
                hasRuleLimit = true;
            }
            if (options.maxSheets && (!hasSheetLimit || options.maxSheets < maxSheets)) {
                maxSheets = options.maxSheets;
                hasSheetLimit = true;
            }
        }
        const injectedCode = function () {
            const countRules = (styleSheet) => {
                const results = {
                    imports: 0,
                    rules: 0,
                    sheets: 1
                };
                try {
                    Array.from(styleSheet.cssRules).forEach((rule) => {
                        if (rule instanceof CSSStyleRule) {
                            results.rules += rule.selectorText.split(',').length;
                        }
                        else if (rule instanceof CSSImportRule) {
                            const subResults = countRules(rule.styleSheet);
                            results.imports += Math.max(results.imports, subResults.imports + 1);
                            results.rules += subResults.rules + 1;
                            results.sheets += subResults.sheets;
                        }
                        else {
                            results.rules += 1;
                        }
                    });
                }
                catch (e) {
                }
                return results;
            };
            const combinedResults = {
                imports: 0,
                rules: 0,
                sheets: 0
            };
            Array.from(document.styleSheets).forEach((sheet) => {
                if (sheet instanceof CSSStyleSheet) {
                    const subResults = countRules(sheet);
                    combinedResults.imports += Math.max(combinedResults.imports, subResults.imports);
                    combinedResults.rules += subResults.rules;
                    combinedResults.sheets += subResults.sheets;
                }
            });
            return combinedResults;
        };
        const validateScanEnd = async (event) => {
            const results = await context.evaluate(`(${injectedCode})()`);
            if (hasImportLimit && results.imports >= maxImports) {
                context.report(event.resource, (0, i18n_import_1.getMessage)('maximumNested', context.language, [maxImports.toString(), results.imports.toString()]), { severity: utils_types_1.Severity.error });
            }
            if (hasRuleLimit && results.rules >= maxRules) {
                context.report(event.resource, (0, i18n_import_1.getMessage)('maximumRules', context.language, [maxRules.toString(), results.rules.toString()]), { severity: utils_types_1.Severity.error });
            }
            if (hasSheetLimit && results.sheets >= maxSheets) {
                context.report(event.resource, (0, i18n_import_1.getMessage)('maximumStylesheets', context.language, [maxSheets.toString(), results.sheets.toString()]), { severity: utils_types_1.Severity.error });
            }
        };
        context.on('can-evaluate::script', validateScanEnd);
    }
}
exports.default = StylesheetLimitsHint;
StylesheetLimitsHint.meta = meta_1.default;
