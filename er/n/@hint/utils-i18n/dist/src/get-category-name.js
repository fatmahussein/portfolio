"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryName = void 0;
const i18n_import_1 = require("./i18n.import");
const getCategoryName = (category, language = 'en') => {
    return (0, i18n_import_1.getMessage)(category, language);
};
exports.getCategoryName = getCategoryName;
