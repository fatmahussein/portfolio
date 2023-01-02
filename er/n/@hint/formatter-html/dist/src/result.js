"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryResult = exports.HintResult = void 0;
const path = require("path");
const cloneDeep = require("lodash/cloneDeep");
const utils_types_1 = require("@hint/utils-types");
const utils_fs_1 = require("@hint/utils-fs");
const utils_i18n_1 = require("@hint/utils-i18n");
const thirdPartyServices = (0, utils_fs_1.loadJSONFile)(path.join(__dirname, 'configs', 'third-party-service-config.json'));
const categoryImages = (0, utils_fs_1.loadJSONFile)(path.join(__dirname, 'configs', 'category-images.json'));
const hintsWithoutDocs = ['optimize-image'];
class HintResult {
    constructor(name, status, url, isScanner) {
        const baseName = name.split('/')[0];
        this.problems = [];
        this.name = name;
        this.status = status;
        this.count = 0;
        this.thirdPartyInfo = thirdPartyServices[baseName] ? cloneDeep(thirdPartyServices[baseName]) : null;
        if (this.thirdPartyInfo) {
            this.thirdPartyInfo.link.replace(/%URL%/, url);
            if (!isScanner) {
                this.thirdPartyInfo.logo.url = this.thirdPartyInfo.logo.url.substr(1);
            }
        }
        this.hasDoc = !hintsWithoutDocs.includes(name);
    }
    addProblem(problem) {
        this.problems.push(problem);
        this.count++;
    }
}
exports.HintResult = HintResult;
class CategoryResult {
    constructor(name, url, isScanner, language) {
        this.cache = new Map();
        this.hints = [];
        this.passed = [];
        this.name = name;
        this.localizedName = (0, utils_i18n_1.getCategoryName)(name.toLowerCase(), language);
        this.hintsCount = 0;
        this.image = categoryImages[name.toLowerCase()];
        this.isScanner = isScanner;
        if (this.image && !isScanner) {
            this.image = this.image.substr(1);
        }
        this.status = 'finished';
        this.url = url;
    }
    getHintByName(name) {
        const lowerCaseName = name.toLowerCase();
        let hint = this.cache.get(lowerCaseName);
        if (!hint) {
            hint = this.hints.find((hi) => {
                return hi.name.toLowerCase() === lowerCaseName;
            });
            if (hint) {
                this.cache.set(lowerCaseName, hint);
            }
        }
        return hint;
    }
    addHint(name, status) {
        let hint = this.getHintByName(name);
        if (hint) {
            return hint;
        }
        hint = new HintResult(name, status, this.url, this.isScanner);
        if (status === 'pass') {
            this.passed.push(hint);
        }
        else {
            this.hints.push(hint);
        }
        return hint;
    }
    addProblem(problem) {
        const hintId = problem.hintId;
        let hint = this.getHintByName(hintId);
        if (!hint) {
            hint = new HintResult(hintId, utils_types_1.Severity[problem.severity].toString(), this.url, this.isScanner);
            this.hints.push(hint);
        }
        if (problem.severity !== utils_types_1.Severity.off && problem.severity !== utils_types_1.Severity.default) {
            this.hintsCount++;
        }
        hint.addProblem(problem);
    }
}
exports.CategoryResult = CategoryResult;
class AnalysisResult {
    constructor(target, options) {
        this.cache = new Map();
        this.pad = (timeString) => {
            return timeString && timeString.length === 1 ? `0${timeString}` : timeString;
        };
        this.url = target;
        this.hintsCount = 0;
        this.status = options.status ? options.status : 'finished';
        this.isFinish = this.status === 'finished' || this.status === 'error';
        this.showError = this.status === 'error';
        this.scanTime = this.parseScanTime(options.scanTime || 0);
        this.date = options.date;
        this.version = options.version;
        this.permalink = '';
        this.id = '';
        this.isScanner = !!options.isScanner;
        this.percentage = 0;
        this.categories = [];
    }
    parseScanTime(scanTime) {
        const seconds = Math.floor((scanTime / 1000) % 60);
        const minutes = Math.floor((scanTime / 1000 / 60) % 60);
        const hours = Math.floor((scanTime / 1000 / 3600));
        const minutesDisplay = this.pad(`${minutes}`);
        const secondsDisplay = this.pad(`${seconds}`);
        let time = `${minutesDisplay}:${secondsDisplay}`;
        if (hours > 0) {
            const hoursDisplay = this.pad(`${hours}`);
            time = `${hoursDisplay}:${time}`;
        }
        return time;
    }
    getCategoryByName(name) {
        const lowerCaseName = name.toLowerCase();
        let category = this.cache.get(lowerCaseName);
        if (!category) {
            category = this.categories.find((cat) => {
                return cat.name.toLowerCase() === lowerCaseName;
            });
            if (category) {
                this.cache.set(lowerCaseName, category);
            }
        }
        return category;
    }
    addProblem(problem, language) {
        const categoryName = problem.category;
        let category = this.getCategoryByName(categoryName);
        if (!category) {
            category = new CategoryResult(categoryName, this.url, this.isScanner, language);
            this.categories.push(category);
        }
        if (problem.severity === utils_types_1.Severity.error || problem.severity === utils_types_1.Severity.warning) {
            this.hintsCount++;
        }
        category.addProblem(problem);
    }
    addCategory(categoryName, language) {
        let category = this.getCategoryByName(categoryName);
        if (category) {
            return;
        }
        category = new CategoryResult(categoryName, this.url, this.isScanner, language);
        this.categories.push(category);
    }
    removeCategory(categoryName) {
        const name = categoryName.toLowerCase();
        const category = this.getCategoryByName(name);
        if (category) {
            this.hintsCount -= category.hintsCount;
            const index = this.categories.indexOf(category);
            this.categories.splice(index, 1);
            this.cache.delete(name);
        }
    }
}
exports.default = AnalysisResult;
