"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const intersection = require("lodash/intersection");
const utils_types_1 = require("@hint/utils-types");
const utils_compat_data_1 = require("@hint/utils-compat-data");
const utils_css_1 = require("@hint/utils-css");
const alternatives_1 = require("./utils/alternatives");
const browsers_1 = require("./utils/browsers");
const filter_supports_1 = require("./utils/filter-supports");
const ignore_1 = require("./utils/ignore");
const css_1 = require("./meta/css");
const i18n_import_1 = require("./i18n.import");
const validateAtSupports = (node, context) => {
    const supported = (0, filter_supports_1.filterSupports)(node.params, context.browsers);
    if (supported) {
        context.walk(node, Object.assign(Object.assign({}, context), { browsers: supported }));
    }
};
const validateAtRule = (node, context) => {
    if (node.name === 'supports') {
        validateAtSupports(node, context);
        return null;
    }
    const unsupported = (0, utils_compat_data_1.getUnsupportedDetails)({ rule: node.name }, context.browsers);
    if (unsupported) {
        const formatFeature = (name) => {
            return `@${name}`;
        };
        return { feature: formatFeature(node.name), formatFeature, node, unsupported };
    }
    context.walk(node, context);
    return null;
};
const validateDeclValue = (node, context, browsers) => {
    if (context.ignore.has(`${node.prop}: ${node.value}`)) {
        return null;
    }
    const unsupported = (0, utils_compat_data_1.getUnsupportedDetails)({ property: node.prop, value: node.value }, browsers);
    if (unsupported) {
        const formatFeature = (value) => {
            return `${node.prop}: ${value}`;
        };
        return { feature: formatFeature(node.value), formatFeature, isValue: true, node, unsupported };
    }
    return null;
};
const validateDecl = (node, context) => {
    const property = node.prop;
    if (context.ignore.has(property) || context.ignore.has(`${property}: ${node.value}`)) {
        return null;
    }
    const unsupported = (0, utils_compat_data_1.getUnsupportedDetails)({ property }, context.browsers);
    if (unsupported) {
        return { feature: `${property}`, node, unsupported };
    }
    return null;
};
const validateRule = (node, context) => {
    context.walk(node, context);
};
const reportUnsupported = (reportsMap, context) => {
    for (const reports of reportsMap.values()) {
        if (reports === 'supported') {
            continue;
        }
        const browsers = intersection(...reports.map((report) => {
            return report.unsupported.browsers;
        }));
        if (!browsers.length) {
            continue;
        }
        const unprefixedReports = reports.filter(({ node }) => {
            switch (node.type) {
                case 'atrule':
                    return !(0, utils_css_1.getVendorPrefix)(node.name);
                case 'decl':
                    return !(0, utils_css_1.getVendorPrefix)(node.prop) && !(0, utils_css_1.getVendorPrefix)(node.value);
                default:
                    return false;
            }
        });
        const finalReports = unprefixedReports.length ? unprefixedReports : reports;
        for (const report of finalReports) {
            const unsupported = {
                browsers,
                details: report.unsupported.details,
                mdnUrl: report.unsupported.mdnUrl
            };
            context.report(Object.assign(Object.assign({}, report), { unsupported }));
        }
    }
};
const walk = (ast, context) => {
    if (!ast.nodes) {
        return;
    }
    const reportsMap = new Map();
    const addToReportsMap = (key, report) => {
        if (!report) {
            reportsMap.set(key, 'supported');
            return;
        }
        const reports = reportsMap.get(key) || [];
        if (reports !== 'supported') {
            reports.push(report);
            reportsMap.set(key, reports);
        }
    };
    for (const node of ast.nodes) {
        let key = '';
        let report = null;
        switch (node.type) {
            case 'atrule':
                key = `@${(0, utils_css_1.getUnprefixed)(node.name)} ${node.params}`;
                report = validateAtRule(node, context);
                break;
            case 'comment':
                break;
            case 'decl':
                key = `${(0, utils_css_1.getUnprefixed)(node.prop)}`;
                report = validateDecl(node, context);
                break;
            case 'rule':
                validateRule(node, context);
                break;
            default:
                throw new Error('Unrecognized node type');
        }
        if (!key) {
            continue;
        }
        addToReportsMap(key, report);
        if (node.type === 'decl') {
            const supportedBrowsers = !report || !report.unsupported ? context.browsers : context.browsers.filter((browser) => {
                return report && !report.unsupported.browsers.includes(browser);
            });
            key = `${(0, utils_css_1.getUnprefixed)(node.prop)}: ${(0, utils_css_1.getUnprefixed)(node.value)}`;
            report = validateDeclValue(node, context, supportedBrowsers);
            addToReportsMap(key, report);
        }
    }
    reportUnsupported(reportsMap, context);
};
class CSSCompatHint {
    constructor(context) {
        const ignore = (0, ignore_1.resolveIgnore)([
            '-moz-appearance: none',
            '-webkit-appearance: none',
            'appearance: none',
            'cursor',
            'zoom: 1'
        ], context.hintOptions);
        context.on('parse::end::css', ({ ast, element, resource }) => {
            const browsers = (0, browsers_1.filterBrowsers)(context.targetedBrowsers);
            const report = ({ feature, formatFeature, isValue, node, unsupported }) => {
                const alternatives = (0, alternatives_1.formatAlternatives)(context.language, unsupported, formatFeature);
                const message = [
                    (0, i18n_import_1.getMessage)('featureNotSupported', context.language, [feature, (0, browsers_1.joinBrowsers)(unsupported)]),
                    ...alternatives
                ].join(' ');
                const codeSnippet = (0, utils_css_1.getCSSCodeSnippet)(node);
                const location = (0, utils_css_1.getCSSLocationFromNode)(node, { isValue });
                const severity = alternatives.length ? utils_types_1.Severity.error : utils_types_1.Severity.warning;
                const documentation = unsupported.mdnUrl ? [{
                        link: unsupported.mdnUrl,
                        text: (0, i18n_import_1.getMessage)('learnMoreCSS', context.language)
                    }] : undefined;
                context.report(resource, message, {
                    browsers: unsupported.browsers,
                    codeLanguage: 'css',
                    codeSnippet,
                    documentation,
                    element,
                    location,
                    severity
                });
            };
            walk(ast, { browsers, ignore, report, walk });
        });
    }
}
exports.default = CSSCompatHint;
CSSCompatHint.meta = css_1.default;
