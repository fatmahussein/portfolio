"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelectorUnsupported = exports.getRuleUnsupported = exports.getDeclarationUnsupported = void 0;
const utils_css_1 = require("@hint/utils-css");
const browser_compat_data_1 = require("./browser-compat-data");
const browsers_1 = require("./browsers");
const cache_1 = require("./cache");
const helpers_1 = require("./helpers");
const mdn_css_types_1 = require("./mdn-css-types");
const selectorParser = require('postcss-selector-parser');
const valueParser = require('postcss-value-parser');
const getTokens = (nodes) => {
    let tokens = [];
    for (const node of nodes) {
        if (node.type === 'function' || node.type === 'word') {
            const prefix = (0, utils_css_1.getVendorPrefix)(node.value);
            const unprefixed = (0, utils_css_1.getUnprefixed)(node.value);
            tokens.push([prefix, unprefixed]);
        }
        if (node.nodes) {
            tokens = [...tokens, ...getTokens(node.nodes)];
        }
    }
    return tokens;
};
const getValueMatchesUnsupported = (context, featureSupport, value, browsers) => {
    const { prefix, tokens, unprefixedValue } = value;
    const matches = featureSupport.__compat && featureSupport.__compat.matches;
    if (!matches) {
        return null;
    }
    if (matches.regex_value && new RegExp(matches.regex_value).exec(unprefixedValue)) {
        return (0, browsers_1.getUnsupportedBrowsers)(featureSupport, prefix, browsers, unprefixedValue, context);
    }
    if (matches.keywords) {
        for (const [tokenPrefix, tokenValue] of tokens) {
            if (matches.keywords.includes(tokenValue)) {
                return (0, browsers_1.getUnsupportedBrowsers)(featureSupport, tokenPrefix, browsers, tokenValue, context);
            }
        }
    }
    if (matches.regex_token) {
        const regexToken = matches.regex_token && new RegExp(matches.regex_token);
        for (const [tokenPrefix, tokenValue] of tokens) {
            if (regexToken && regexToken.exec(tokenValue)) {
                return (0, browsers_1.getUnsupportedBrowsers)(featureSupport, tokenPrefix, browsers, tokenValue, context);
            }
        }
    }
    return null;
};
const getValueTokenUnsupported = (context, featureName, featureSupport, value, browsers) => {
    for (const [tokenPrefix, tokenValue] of value.tokens) {
        if (featureName === tokenValue) {
            return (0, browsers_1.getUnsupportedBrowsers)(featureSupport, tokenPrefix, browsers, tokenValue, context);
        }
    }
    return null;
};
const getPartialValueUnsupported = (context, value, browsers) => {
    for (const [featureName, featureSupport] of Object.entries(context)) {
        if (featureName === '__compat') {
            continue;
        }
        const unsupported = getValueMatchesUnsupported(context, featureSupport, value, browsers) ||
            getValueTokenUnsupported(context, featureName, featureSupport, value, browsers) ||
            getPartialValueUnsupported(featureSupport, value, browsers);
        if (unsupported) {
            return unsupported;
        }
    }
    return null;
};
const getValueUnsupported = (context, property, value, browsers) => {
    var _a;
    const [data, prefix, unprefixedValue] = (0, helpers_1.getFeatureData)(context, value);
    if (data) {
        return (0, browsers_1.getUnsupportedBrowsers)(data, prefix, browsers, unprefixedValue, ((_a = data.__compat) === null || _a === void 0 ? void 0 : _a.mdn_url) ? undefined : context);
    }
    const parsedValue = {
        prefix,
        tokens: getTokens(valueParser(value).nodes),
        unprefixedValue
    };
    if (mdn_css_types_1.types.has(property)) {
        for (const type of mdn_css_types_1.types.get(property)) {
            const typeContext = browser_compat_data_1.mdn.css.types[type];
            const result = typeContext && getPartialValueUnsupported(typeContext, parsedValue, browsers);
            if (result) {
                return result;
            }
        }
    }
    return context ? getPartialValueUnsupported(context, parsedValue, browsers) : null;
};
const getDeclarationUnsupported = (feature, browsers) => {
    const key = `css-declaration:${feature.property}|${feature.value || ''}`;
    return (0, cache_1.getCachedValue)(key, browsers, () => {
        const [data, prefix, unprefixed] = (0, helpers_1.getFeatureData)(browser_compat_data_1.mdn.css.properties, feature.property);
        if (feature.value) {
            return getValueUnsupported(data, unprefixed, feature.value, browsers);
        }
        return (0, browsers_1.getUnsupportedBrowsers)(data, prefix, browsers, unprefixed);
    });
};
exports.getDeclarationUnsupported = getDeclarationUnsupported;
const getRuleUnsupported = (feature, browsers) => {
    return (0, cache_1.getCachedValue)(`css-rule:${feature.rule}`, browsers, () => {
        const [data, prefix, unprefixed] = (0, helpers_1.getFeatureData)(browser_compat_data_1.mdn.css['at-rules'], feature.rule);
        return (0, browsers_1.getUnsupportedBrowsers)(data, prefix, browsers, unprefixed);
    });
};
exports.getRuleUnsupported = getRuleUnsupported;
const getPseudoSelectorUnsupported = (value, browsers) => {
    const name = value.replace(/^::?/, '');
    return (0, cache_1.getCachedValue)(`css-pseudo-selector:${name}`, browsers, () => {
        const [data, prefix, unprefixed] = (0, helpers_1.getFeatureData)(browser_compat_data_1.mdn.css.selectors, name);
        return (0, browsers_1.getUnsupportedBrowsers)(data, prefix, browsers, unprefixed);
    });
};
const getSelectorUnsupported = (feature, browsers) => {
    const parser = selectorParser();
    const root = parser.astSync(feature.selector);
    const unsupported = {
        browsers: [],
        details: new Map()
    };
    root.walkPseudos((node) => {
        const result = getPseudoSelectorUnsupported(node.value, browsers);
        if (result) {
            unsupported.browsers = [...unsupported.browsers, ...result.browsers];
            for (const [browser, details] of result.details) {
                unsupported.details.set(browser, details);
            }
        }
    });
    return unsupported.browsers.length ? unsupported : null;
};
exports.getSelectorUnsupported = getSelectorUnsupported;
