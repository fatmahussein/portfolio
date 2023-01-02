"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const hint_1 = require("hint");
const i18n_import_1 = require("./i18n.import");
const meta = {
    docs: {
        category: utils_types_1.Category.performance,
        description: (0, i18n_import_1.getMessage)('description', 'en'),
        name: (0, i18n_import_1.getMessage)('name', 'en')
    },
    getDescription(language) {
        return (0, i18n_import_1.getMessage)('description', language);
    },
    getName(language) {
        return (0, i18n_import_1.getMessage)('name', language);
    },
    id: 'image-optimization-cloudinary',
    schema: [{
            additionalProperties: false,
            properties: {
                apiKey: { type: 'string' },
                apiSecret: { type: 'string' },
                cloudName: { type: 'string' },
                threshold: { type: 'number' }
            }
        }],
    scope: hint_1.HintScope.any
};
exports.default = meta;
