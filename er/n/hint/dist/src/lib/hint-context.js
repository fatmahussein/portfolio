"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HintContext = void 0;
const utils_types_1 = require("@hint/utils-types");
const utils_types_2 = require("@hint/utils-types");
const utils_dom_1 = require("@hint/utils-dom");
class HintContext {
    constructor(hintId, engine, severity, options, meta, ignoredUrls) {
        this.id = hintId;
        this.options = options;
        this.meta = meta;
        this.engine = engine;
        this.severity = severity;
        this.ignoredUrls = ignoredUrls;
        Object.freeze(this);
    }
    get engineKey() {
        return this.engine;
    }
    get pageDOM() {
        return this.engine.pageDOM;
    }
    get pageContent() {
        return this.engine.pageContent;
    }
    get pageHeaders() {
        return this.engine.pageHeaders;
    }
    get targetedBrowsers() {
        return this.engine.targetedBrowsers;
    }
    get hintOptions() {
        if (Array.isArray(this.options)) {
            return this.options[1];
        }
        return null;
    }
    evaluate(source) {
        return this.engine.evaluate(source);
    }
    fetchContent(target, headers) {
        return this.engine.fetchContent(target, headers);
    }
    querySelectorAll(selector) {
        return this.engine.querySelectorAll(selector);
    }
    adjustFixLocations(element, fixes) {
        if (!fixes) {
            return fixes;
        }
        return fixes.map((fix) => {
            var _a;
            return Object.assign(Object.assign({}, fix), { location: (_a = element.getContentLocation(fix.location)) !== null && _a !== void 0 ? _a : fix.location });
        });
    }
    findProblemLocation(element, offset, attribute) {
        if (attribute) {
            const { column, line, startOffset } = element.getAttributeLocation(attribute);
            return { column, line, startOffset };
        }
        if (offset) {
            return element.getContentLocation(offset);
        }
        const { column, elementId, line, startOffset } = element.getLocation();
        return { column: column + 1, elementId, line, startOffset };
    }
    report(resource, message, options) {
        const { attribute, codeSnippet, element, severity = utils_types_1.Severity.warning, fixes } = options;
        let sourceCode = null;
        let position = options.location || null;
        let adjustedFixes = fixes;
        if (attribute && !element) {
            throw new Error('The `element` option must be specified when `attribute` is provided.');
        }
        if (element) {
            position = this.findProblemLocation(element, position, attribute);
            sourceCode = (0, utils_dom_1.getHTMLCodeSnippet)(element);
        }
        if (element && options.codeLanguage && options.codeLanguage !== 'html') {
            adjustedFixes = this.adjustFixLocations(element, fixes);
        }
        const finalSeverity = this.severity !== utils_types_1.Severity.default && !options.forceSeverity ?
            this.severity :
            severity;
        this.engine.report({
            browsers: options.browsers,
            category: (this.meta && this.meta.docs && this.meta.docs.category) ? this.meta.docs.category : utils_types_2.Category.other,
            codeLanguage: options.codeLanguage,
            documentation: options.documentation,
            fixes: adjustedFixes,
            hintId: this.id,
            location: position || { column: -1, line: -1 },
            message,
            resource,
            severity: finalSeverity,
            sourceCode: codeSnippet || sourceCode || ''
        });
    }
    on(event, listener) {
        this.engine.onHintEvent(this.id, event, listener);
    }
    isUrlIgnored(resource) {
        return this.ignoredUrls.some((urlIgnored) => {
            return urlIgnored.test(resource);
        });
    }
    get language() {
        return this.engine.language;
    }
}
exports.HintContext = HintContext;
