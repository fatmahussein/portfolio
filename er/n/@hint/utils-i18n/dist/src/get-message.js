"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessage = void 0;
const format_1 = require("./format");
const cache = new Map();
const getLanguages = (language) => {
    const languageParts = language.split('-');
    const mainLanguage = languageParts[0];
    const languages = [language, mainLanguage];
    if (mainLanguage !== 'en') {
        languages.push('en');
    }
    return languages;
};
const getMessages = (path, language) => {
    const cacheKey = `${path}-${language}`;
    const messages = cache.get(cacheKey);
    if (messages) {
        return messages;
    }
    const languages = language === 'en' ? ['en'] : getLanguages(language);
    const json = languages.reduce((result, lang) => {
        if (result) {
            return result;
        }
        try {
            const json = require(`${path}/_locales/${lang}/messages.json`);
            return json;
        }
        catch (e) {
            return null;
        }
    }, null);
    if (!json) {
        throw new Error(`Localization file not found for ${path} and language: ${language}`);
    }
    cache.set(cacheKey, json);
    return json;
};
const getMessage = (key, path, options) => {
    const language = (options && options.language) || 'en';
    const substitutions = options && options.substitutions;
    const messages = getMessages(path, language);
    const message = messages[key] && messages[key].message;
    if (!message) {
        return key;
    }
    return (0, format_1.format)(message, substitutions);
};
exports.getMessage = getMessage;
