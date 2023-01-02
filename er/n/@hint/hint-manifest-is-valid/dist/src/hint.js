"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcp47_1 = require("bcp47");
const color_string_1 = require("color-string");
const utils_types_1 = require("@hint/utils-types");
const utils_compat_data_1 = require("@hint/utils-compat-data");
const utils_string_1 = require("@hint/utils-string");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
class ManifestIsValidHint {
    constructor(context) {
        const isNotSupportedColorValue = (color, normalizedColorValue) => {
            const hexWithAlphaRegex = /^#([0-9a-fA-F]{4}){1,2}$/;
            return (color.model === 'rgb' &&
                hexWithAlphaRegex.test(normalizedColorValue) &&
                !(0, utils_compat_data_1.isSupported)({ property: 'color', value: '#00000000' }, context.targetedBrowsers)) ||
                color.model === 'hwb';
        };
        const checkColors = (resource, manifest, getLocation) => {
            const colorProperties = [
                'background_color',
                'theme_color'
            ];
            for (const property of colorProperties) {
                const colorValue = manifest[property];
                const normalizedColorValue = (0, utils_string_1.normalizeString)(colorValue, '');
                if (!normalizedColorValue) {
                    continue;
                }
                const color = (0, color_string_1.get)(normalizedColorValue);
                if (color === null) {
                    const location = getLocation(property);
                    const message = (0, i18n_import_1.getMessage)('invalidValue', context.language, [`${colorValue}`, property]);
                    context.report(resource, message, { location, severity: utils_types_1.Severity.error });
                    continue;
                }
                if (isNotSupportedColorValue(color, normalizedColorValue)) {
                    const location = getLocation(property);
                    const message = (0, i18n_import_1.getMessage)('unsupportedValue', context.language, [`${colorValue}`, property]);
                    context.report(resource, message, { location, severity: utils_types_1.Severity.error });
                }
            }
        };
        const checkLang = (resource, manifest, getLocation) => {
            const lang = manifest.lang;
            if (lang && !(0, bcp47_1.parse)(lang)) {
                const location = getLocation('lang');
                const message = (0, i18n_import_1.getMessage)('invalidValue', context.language, [lang, 'lang']);
                context.report(resource, message, { location, severity: utils_types_1.Severity.error });
            }
        };
        const handleInvalidJSON = (manifestInvalidJSON) => {
            const { resource } = manifestInvalidJSON;
            context.report(resource, (0, i18n_import_1.getMessage)('validJSON', context.language), { severity: utils_types_1.Severity.error });
        };
        const handleInvalidSchema = (manifestInvalidSchemaEvent) => {
            for (let i = 0; i < manifestInvalidSchemaEvent.groupedErrors.length; i++) {
                const error = manifestInvalidSchemaEvent.groupedErrors[i].message;
                const location = manifestInvalidSchemaEvent.groupedErrors[i].location;
                context.report(manifestInvalidSchemaEvent.resource, error, { location, severity: utils_types_1.Severity.error });
            }
        };
        const validateOtherProperties = (manifestParsed) => {
            const { getLocation, parsedContent: manifest, resource } = manifestParsed;
            checkLang(resource, manifest, getLocation);
            checkColors(resource, manifest, getLocation);
        };
        context.on('parse::end::manifest', validateOtherProperties);
        context.on('parse::error::manifest::json', handleInvalidJSON);
        context.on('parse::error::manifest::schema', handleInvalidSchema);
    }
}
exports.default = ManifestIsValidHint;
ManifestIsValidHint.meta = meta_1.default;
