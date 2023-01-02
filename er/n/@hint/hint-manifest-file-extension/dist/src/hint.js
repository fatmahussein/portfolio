"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_string_1 = require("@hint/utils-string");
const utils_fs_1 = require("@hint/utils-fs");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
class ManifestFileExtensionHint {
    constructor(context) {
        const standardManifestFileExtension = 'webmanifest';
        const validate = ({ element, resource }) => {
            if ((0, utils_string_1.normalizeString)(element.getAttribute('rel')) === 'manifest') {
                const href = element.resolveUrl(element.getAttribute('href') || '');
                const fileExtension = (0, utils_fs_1.fileExtension)((0, utils_string_1.normalizeString)(href) || '');
                if (fileExtension !== standardManifestFileExtension) {
                    const message = (0, i18n_import_1.getMessage)('shouldHaveFileExtension', context.language, standardManifestFileExtension);
                    const severity = fileExtension === 'json' ? utils_types_1.Severity.hint : utils_types_1.Severity.warning;
                    context.report(resource, message, { content: fileExtension, element, severity });
                }
            }
        };
        context.on('element::link', validate);
    }
}
exports.default = ManifestFileExtensionHint;
ManifestFileExtensionHint.meta = meta_1.default;
