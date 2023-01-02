"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const punycode_1 = require("punycode/punycode");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
class ManifestAppNameHint {
    constructor(context) {
        const checkIfPropertyExists = (resource, content, propertyName) => {
            if (typeof content === 'undefined') {
                context.report(resource, (0, i18n_import_1.getMessage)('shouldHaveProperty', context.language, propertyName), { severity: utils_types_1.Severity.error });
            }
        };
        const checkIfPropertyValueIsNotEmpty = (resource, content, propertyName, getLocation) => {
            if (typeof content === 'string' && (content.trim() === '')) {
                const message = (0, i18n_import_1.getMessage)('shouldHaveNonEmptyProperty', context.language, propertyName);
                const location = getLocation(propertyName, { at: 'value' });
                context.report(resource, message, { location, severity: utils_types_1.Severity.error });
            }
        };
        const checkIfPropertyValueIsUnderLimit = (resource, content, propertyName, shortNameLengthLimit, getLocation) => {
            if (content && (punycode_1.ucs2.decode(content).length > shortNameLengthLimit)) {
                const message = (0, i18n_import_1.getMessage)('shouldHavePropertyShort', context.language, [propertyName, shortNameLengthLimit.toString()]);
                const location = getLocation(propertyName, { at: 'value' });
                context.report(resource, message, { location, severity: utils_types_1.Severity.warning });
                return false;
            }
            return true;
        };
        const validate = ({ getLocation, parsedContent: manifest, resource }) => {
            const name = manifest.name;
            const nameLengthLimit = 30;
            const shortNameLengthLimit = 12;
            checkIfPropertyExists(resource, name, 'name');
            checkIfPropertyValueIsNotEmpty(resource, name, 'name', getLocation);
            checkIfPropertyValueIsUnderLimit(resource, name, 'name', nameLengthLimit, getLocation);
            const shortName = manifest.short_name;
            const shortNameIsRequired = typeof name === 'string' && (name.trim() !== '') && (punycode_1.ucs2.decode(name).length > shortNameLengthLimit);
            if (!shortName && !shortNameIsRequired) {
                return;
            }
            checkIfPropertyExists(resource, shortName, 'short_name');
            checkIfPropertyValueIsNotEmpty(resource, shortName, 'short_name', getLocation);
            checkIfPropertyValueIsUnderLimit(resource, shortName, 'short_name', shortNameLengthLimit, getLocation);
        };
        context.on('parse::end::manifest', validate);
    }
}
exports.default = ManifestAppNameHint;
ManifestAppNameHint.meta = meta_1.default;
