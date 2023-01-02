"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const hint_1 = require("hint");
const i18n_import_1 = require("./i18n.import");
const meta = {
    docs: {
        category: utils_types_1.Category.compatibility,
        description: (0, i18n_import_1.getMessage)('description', 'en'),
        name: (0, i18n_import_1.getMessage)('name', 'en')
    },
    getDescription(language) {
        return (0, i18n_import_1.getMessage)('description', language);
    },
    getName(language) {
        return (0, i18n_import_1.getMessage)('name', language);
    },
    id: 'html-checker',
    schema: [{
            properties: {
                details: { type: 'boolean' },
                ignore: {
                    anyOf: [
                        {
                            items: { type: 'string' },
                            type: 'array'
                        }, { type: 'string' }
                    ]
                },
                validator: {
                    pattern: '^(http|https)://',
                    type: 'string'
                }
            }
        }],
    scope: hint_1.HintScope.any
};
exports.default = meta;
