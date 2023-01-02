"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const hint_scope_1 = require("hint/dist/src/lib/enums/hint-scope");
const i18n_import_1 = require("../i18n.import");
const meta = {
    docs: {
        category: utils_types_1.Category.accessibility,
        description: (0, i18n_import_1.getMessage)('parsing_description', 'en'),
        name: (0, i18n_import_1.getMessage)('parsing_name', 'en')
    },
    getDescription(language) {
        return (0, i18n_import_1.getMessage)('parsing_description', language);
    },
    getName(language) {
        return (0, i18n_import_1.getMessage)('parsing_name', language);
    },
    id: 'axe/parsing',
    schema: [
        {
            additionalProperties: false,
            properties: {
                'duplicate-id': { enum: ['off', 'information', 'hint', 'warning', 'error', 'default'], type: 'string' },
                'duplicate-id-active': { enum: ['off', 'information', 'hint', 'warning', 'error', 'default'], type: 'string' },
                'duplicate-id-aria': { enum: ['off', 'information', 'hint', 'warning', 'error', 'default'], type: 'string' },
                marquee: { enum: ['off', 'information', 'hint', 'warning', 'error', 'default'], type: 'string' }
            }
        },
        {
            items: {
                enum: ['duplicate-id', 'duplicate-id-active', 'duplicate-id-aria', 'marquee'],
                type: 'string'
            },
            typeof: 'array',
            uniqueItems: true
        }
    ],
    scope: hint_scope_1.HintScope.any
};
exports.default = meta;
