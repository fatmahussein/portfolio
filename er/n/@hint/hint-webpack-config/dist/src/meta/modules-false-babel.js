"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_types_1 = require("@hint/utils-types");
const hint_1 = require("hint");
const i18n_import_1 = require("../i18n.import");
const meta = {
    docs: {
        category: utils_types_1.Category.development,
        description: (0, i18n_import_1.getMessage)('modulesFalseBabel_description', 'en'),
        name: (0, i18n_import_1.getMessage)('modulesFalseBabel_name', 'en')
    },
    getDescription(language) {
        return (0, i18n_import_1.getMessage)('modulesFalseBabel_description', language);
    },
    getName(language) {
        return (0, i18n_import_1.getMessage)('modulesFalseBabel_name', language);
    },
    id: 'webpack-config/modules-false-babel',
    schema: [],
    scope: hint_1.HintScope.local
};
exports.default = meta;
