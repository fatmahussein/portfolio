"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinBrowsers = exports.formatUnsupported = exports.formatSupported = exports.filterBrowsers = void 0;
const utils_compat_data_1 = require("@hint/utils-compat-data");
const filterBrowsers = (browsers) => {
    return browsers.filter((browser) => {
        if (browser.startsWith('android')) {
            return false;
        }
        if (browser === 'samsung 4') {
            return false;
        }
        if (browser === 'safari 5.1') {
            return false;
        }
        return true;
    });
};
exports.filterBrowsers = filterBrowsers;
const formatSupported = (browser, versionAdded, versionRemoved) => {
    const browserName = (0, utils_compat_data_1.getFriendlyName)(browser);
    if (versionAdded && versionRemoved) {
        return `${browserName} ${versionAdded}-${versionRemoved}`;
    }
    else if (versionAdded && parseFloat(versionAdded) !== 1) {
        return `${browserName} ${versionAdded}+`;
    }
    else if (versionRemoved) {
        return `${browserName} < ${versionRemoved}`;
    }
    return browserName;
};
exports.formatSupported = formatSupported;
const formatUnsupported = (browser, versionAdded, versionRemoved) => {
    const browserName = (0, utils_compat_data_1.getFriendlyName)(browser);
    if (versionAdded && versionRemoved) {
        return `${browserName} ${versionRemoved}-${versionAdded}`;
    }
    else if (versionAdded) {
        return `${browserName} < ${versionAdded}`;
    }
    else if (versionRemoved) {
        return `${browserName} ${versionRemoved}+`;
    }
    return browserName;
};
exports.formatUnsupported = formatUnsupported;
const joinBrowsers = (unsupported) => {
    const summaries = unsupported.browsers.map((browser) => {
        const details = unsupported.details.get(browser);
        if (!details) {
            throw new Error(`No details provided for browser: ${browser}`);
        }
        return (0, exports.formatUnsupported)(browser, details.versionAdded, details.versionRemoved);
    });
    return [...new Set(summaries)].sort().join(', ');
};
exports.joinBrowsers = joinBrowsers;
