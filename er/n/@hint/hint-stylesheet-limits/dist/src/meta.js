"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const hint_scope_1 = require("hint/dist/src/lib/enums/hint-scope");
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
    id: 'stylesheet-limits',
    schema: [{
            additionalProperties: false,
            definitions: {
                number: {
                    minimum: 0,
                    type: 'integer'
                }
            },
            properties: {
                maxImports: { $ref: '#/definitions/number' },
                maxRules: { $ref: '#/definitions/number' },
                maxSheets: { $ref: '#/definitions/number' }
            },
            type: ['object', 'null']
        }],
    scope: hint_scope_1.HintScope.site
};
exports.default = meta;
