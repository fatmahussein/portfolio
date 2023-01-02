"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const ejs = require("ejs");
const fs = require("fs-extra");
const utils_types_1 = require("@hint/utils-types");
const utils_1 = require("@hint/utils");
const utils_fs_1 = require("@hint/utils-fs");
const utils_debug_1 = require("@hint/utils-debug");
const utils = require('./utils');
const result_1 = require("./result");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
const scriptsList = [
    'js/highlight/highlight.min.js',
    'js/highlight/languages/xml.min.js',
    'js/polyfills/details.js',
    'js/anchor-top.js',
    'js/scan/_locales/messages.js',
    'js/scan/get-message.js',
    'js/scan/scanner-common.js'
];
const stylesList = [
    'styles/fonts.css',
    'styles/base.css',
    'styles/controls.css',
    'styles/type.css',
    'styles/layouts.css',
    'styles/structure.css',
    'styles/anchor-top.css',
    'styles/scan/scan-results.css',
    'styles/highlight/default.min.css'
];
const mediaTypes = {
    png: 'image/png',
    svg: 'image/svg+xml',
    woff: 'font/woff',
    woff2: 'font/woff2'
};
const getCategoryListFromResources = (resources) => {
    const categoriesArray = resources.hints.map((hint) => {
        if (hint.meta.docs && hint.meta.docs.category) {
            return hint.meta.docs.category;
        }
        return utils_types_1.Category.other;
    });
    const categories = new Set(categoriesArray);
    return Array.from(categories);
};
const getCategoryList = (resources) => {
    if (resources) {
        return getCategoryListFromResources(resources);
    }
    const result = [];
    for (const [, value] of Object.entries(utils_types_1.Category)) {
        result.push(value);
    }
    return result;
};
const createLanguageFile = async (language = 'en') => {
    const rootPath = path.join(__dirname, 'assets', 'js', 'scan', '_locales');
    const languagesToCheck = [language];
    const languageParts = language.split('-');
    if (languageParts.length > 1) {
        languagesToCheck.push(languageParts[0]);
    }
    let existingLanguage = 'en';
    for (const lang of languagesToCheck) {
        const file = path.join(rootPath, lang, 'messages.js');
        if (fs.existsSync(file)) {
            existingLanguage = lang;
            break;
        }
    }
    const orig = path.join(rootPath, existingLanguage, 'messages.js');
    const dest = path.join(rootPath, 'messages.js');
    await fs.copyFile(orig, dest);
};
const removeLanguageFile = async () => {
    await fs.unlink(path.join(__dirname, 'assets', 'js', 'scan', '_locales', 'messages.js'));
};
const getScriptsContent = async (files) => {
    const result = [];
    for (const file of files) {
        const regex = /<\/script>/g;
        const content = await (0, utils_fs_1.readFileAsync)(path.resolve(__dirname, 'assets', file));
        result.push({
            content: content.replace(regex, '</scr"+"ipt>'),
            file
        });
    }
    return result;
};
const isFont = (extension) => {
    return extension === 'woff' || extension === 'woff2';
};
const getDataUri = (file) => {
    const extensionFile = path.extname(file).slice(1);
    const mediaType = mediaTypes[extensionFile];
    const content = fs.readFileSync(path.join(__dirname, 'assets', isFont(extensionFile) ? 'styles' : '', file));
    const data = Buffer.from(content).toString('base64');
    const dataUri = `data:${mediaType};base64,${data}`;
    return dataUri;
};
const replaceRegex = (match, file) => {
    const dataUri = getDataUri(file);
    return `url('${dataUri}')`;
};
const getStylesContent = async (files) => {
    const result = [];
    for (const file of files) {
        let content = await (0, utils_fs_1.readFileAsync)(path.resolve(__dirname, 'assets', file));
        const urlCSSRegex = /url\(['"]?([^'")]*)['"]?\)/g;
        content = content.replace(urlCSSRegex, replaceRegex);
        result.push({
            content,
            file
        });
    }
    return result;
};
class HTMLFormatter {
    renderFile(filename, data) {
        return new Promise((resolve, reject) => {
            ejs.renderFile(filename, data, { filename }, (err, html) => {
                if (err) {
                    return reject(err);
                }
                return resolve(html);
            });
        });
    }
    async format(problems, options = {}) {
        debug('Formatting results');
        const language = options.language;
        const target = options.target || '';
        const result = new result_1.default(target, options);
        const categoryList = getCategoryList(options.resources);
        categoryList.forEach((category) => {
            result.addCategory(category, language);
        });
        problems.forEach((message) => {
            result.addProblem(message, language);
        });
        if (options.resources) {
            options.resources.hints.forEach((hintConstructor) => {
                const categoryName = hintConstructor.meta.docs.category;
                const hintId = hintConstructor.meta.id;
                const category = result.getCategoryByName(categoryName);
                const hint = category.getHintByName(hintId);
                if (!hint) {
                    category.addHint(hintId, 'pass');
                }
            });
        }
        try {
            if (!options.noGenerateFiles) {
                result.percentage = 100;
                result.id = Date.now().toString();
                await createLanguageFile(language);
                const htmlPath = path.join(__dirname, 'views', 'pages', 'report.ejs');
                const scripts = await getScriptsContent(scriptsList);
                const html = await this.renderFile(htmlPath, {
                    getDataUri,
                    getMessage(key, substitutions) {
                        return (0, i18n_import_1.getMessage)(key, language, substitutions);
                    },
                    result,
                    scripts,
                    styles: await getStylesContent(stylesList),
                    utils
                });
                await removeLanguageFile();
                const name = target.replace(/:\/\//g, '-')
                    .replace(/:/g, '-')
                    .replace(/\./g, '-')
                    .replace(/\//g, '-')
                    .replace(/[?=]/g, '-query-')
                    .replace(/-$/, '');
                const destDir = options.output || path.join((0, utils_fs_1.cwd)(), 'hint-report');
                const destination = path.join(destDir, `${name}.html`);
                await fs.outputFile(destination, html);
                utils_1.logger.log((0, i18n_import_1.getMessage)('youCanView', language, destination));
            }
            return result;
        }
        catch (err) {
            utils_1.logger.error(err);
            throw err;
        }
    }
}
exports.default = HTMLFormatter;
