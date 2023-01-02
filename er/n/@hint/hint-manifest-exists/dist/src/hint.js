"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const utils_string_1 = require("@hint/utils-string");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
class ManifestExistsHint {
    constructor(context) {
        let manifestIsSpecified = false;
        const checkIfManifest = (data) => {
            const { element, resource } = data;
            if ((0, utils_string_1.normalizeString)(element.getAttribute('rel')) !== 'manifest') {
                return;
            }
            if (manifestIsSpecified) {
                context.report(resource, (0, i18n_import_1.getMessage)('manifestDuplicated', context.language), {
                    element,
                    severity: utils_types_1.Severity.warning
                });
                return;
            }
            manifestIsSpecified = true;
            const href = (0, utils_string_1.normalizeString)(element.getAttribute('href'));
            if (!href) {
                context.report(resource, (0, i18n_import_1.getMessage)('manifestNonEmptyHref', context.language), {
                    element,
                    severity: utils_types_1.Severity.error
                });
            }
        };
        const handleFetchEnd = ({ element, resource, response }) => {
            if (response.statusCode >= 400) {
                context.report(resource, (0, i18n_import_1.getMessage)('manifestNotFetchedStatus', context.language, `${response.statusCode}`), {
                    element,
                    severity: utils_types_1.Severity.error
                });
            }
        };
        const handleFetchErrors = (fetchErrorEvent) => {
            const { resource, element } = fetchErrorEvent;
            context.report(resource, (0, i18n_import_1.getMessage)('manifestNotFetched', context.language), {
                element,
                severity: utils_types_1.Severity.error
            });
        };
        context.on('element::link', checkIfManifest);
        context.on('fetch::end::manifest', handleFetchEnd);
        context.on('fetch::error::manifest', handleFetchErrors);
    }
}
exports.default = ManifestExistsHint;
ManifestExistsHint.meta = meta_1.default;
