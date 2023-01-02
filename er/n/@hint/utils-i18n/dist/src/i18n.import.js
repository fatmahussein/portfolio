"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessage = void 0;
const get_message_1 = require("./get-message");
const getMessage = (message, language, substitutions) => {
    const options = {
        language,
        substitutions
    };
    return (0, get_message_1.getMessage)(message, __dirname, options);
};
exports.getMessage = getMessage;
