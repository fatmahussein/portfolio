"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessage = void 0;
const utils_i18n_1 = require("@hint/utils-i18n");
const getMessage = (message, language, substitutions) => {
    const options = {
        language,
        substitutions
    };
    return (0, utils_i18n_1.getMessage)(message, __dirname, options);
};
exports.getMessage = getMessage;
