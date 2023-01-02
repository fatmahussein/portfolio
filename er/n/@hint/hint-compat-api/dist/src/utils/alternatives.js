"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAlternatives = void 0;
const i18n_import_1 = require("../i18n.import");
const browsers_1 = require("./browsers");
const groupAlternatives = (unsupported) => {
    const groupedAlternatives = new Map();
    for (const browser of unsupported.browsers) {
        const details = unsupported.details.get(browser);
        if (details && details.alternative) {
            const { name } = details.alternative;
            const group = groupedAlternatives.get(name) || [];
            group.push(Object.assign({ browser }, details.alternative));
            groupedAlternatives.set(name, group);
        }
    }
    return groupedAlternatives;
};
const formatAlternatives = (language, unsupported, formatFeature) => {
    const groupedAlternatives = groupAlternatives(unsupported);
    const alternativeMessages = new Set();
    for (const [name, list] of groupedAlternatives) {
        const formattedName = formatFeature ? formatFeature(name) : name;
        const browsers = list.map(({ browser, versionAdded, versionRemoved }) => {
            return (0, browsers_1.formatSupported)(browser, versionAdded, versionRemoved);
        });
        const uniqueBrowsers = [...new Set(browsers)].sort();
        alternativeMessages.add((0, i18n_import_1.getMessage)('featureAlternative', language, [formattedName, uniqueBrowsers.join(', ')]));
    }
    return [...alternativeMessages];
};
exports.formatAlternatives = formatAlternatives;
