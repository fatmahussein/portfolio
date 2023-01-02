"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const hint_scope_1 = require("hint/dist/src/lib/enums/hint-scope");
const i18n_import_1 = require("../i18n.import");
const schema = require('./compat-hint-schema.json');
const meta = {
    docs: {
        category: utils_types_1.Category.compatibility,
        description: (0, i18n_import_1.getMessage)('css_description', 'en'),
        name: (0, i18n_import_1.getMessage)('css_name', 'en')
    },
    getDescription(language) {
        return (0, i18n_import_1.getMessage)('css_description', language);
    },
    getName(language) {
        return (0, i18n_import_1.getMessage)('css_name', language);
    },
    id: 'compat-api/css',
    schema: [schema],
    scope: hint_scope_1.HintScope.any
};
exports.default = meta;
