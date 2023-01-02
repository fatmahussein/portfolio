"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_types_1 = require("@hint/utils-types");
const utils_1 = require("@hint/utils");
const target_1 = require("./meta/target");
const i18n_import_1 = require("./i18n.import");
const config_checker_1 = require("./helpers/config-checker");
class TypeScriptConfigTarget {
    constructor(context) {
        const Targets = new Map([
            ['es3', 'ES3'],
            ['es5', 'ES5'],
            ['es6', 'ES2015'],
            ['es2015', 'ES2015'],
            ['es2016', 'ES2016'],
            ['es2017', 'ES2017'],
            ['es2018', 'ES2018'],
            ['esnext', 'ESNext'],
            ['latest', 'ESNext']
        ]);
        const compatMatrix = {
            es5: {
                chrome: 5,
                edge: 12,
                firefox: 4,
                ie: 9,
                ie_mob: 9,
                opera: 44,
                safari: 5
            },
            es2015: {
                chrome: 49,
                edge: 13,
                firefox: 37,
                ie: 'none',
                ie_mob: 'none',
                opera: 44,
                safari: 10
            },
            es2016: {
                chrome: 57,
                edge: 14,
                firefox: 52,
                ie: 'none',
                ie_mob: 'none',
                opera: 44,
                safari: 10.1
            },
            es2017: {
                chrome: 58,
                edge: 16,
                firefox: 53,
                ie: 'none',
                ie_mob: 'none',
                opera: 45,
                safari: 10.1
            }
        };
        const getMajor = (version) => {
            if (typeof version === 'number') {
                return version;
            }
            return parseInt(version.split('-')[0].split('.')[0]);
        };
        const isOlder = (version1, version2) => {
            if (typeof version1 === 'number' && typeof version2 === 'number') {
                return version1 < version2;
            }
            if (typeof version1 === 'string' && typeof version2 === 'string') {
                if (version1.includes('-') || version2.includes('-')) {
                    const range1 = version1.split('-')[0];
                    const range2 = version2.split('-')[0];
                    if (range1.includes('.') && range2.includes('.')) {
                        const parts1 = range1.split('.');
                        const parts2 = range2.split('.');
                        let older = true;
                        for (let i = 0; i < parts1.length && older; i++) {
                            older = isOlder(parseInt(parts1[i]), parseInt(parts2[i]));
                        }
                        return older;
                    }
                    return isOlder(parseInt(range1), parseInt(range2));
                }
            }
            return isOlder(getMajor(version1), getMajor(version2));
        };
        const toMiniumBrowser = (targetedBrowsers) => {
            const configuration = targetedBrowsers.reduce((config, browserVersion) => {
                const [browser, strVersion] = browserVersion.split(' ');
                const version = strVersion.includes('.') || strVersion.includes('-') ? strVersion : parseInt(strVersion);
                const previousVersion = config[browser];
                if (!previousVersion || isOlder(version, previousVersion)) {
                    config[browser] = version;
                }
                return config;
            }, {});
            return configuration;
        };
        const normalizeScriptTarget = (target) => {
            return Targets.get(target) || target;
        };
        const getMaxVersion = (minimumBrowsers) => {
            const versions = Object.keys(compatMatrix);
            let maxVersion = 'ES3';
            versions.forEach((version) => {
                const browsers = Object.entries(compatMatrix[version]);
                const validates = browsers.reduce((valid, [browser, minimumBrowserVersion]) => {
                    const minimumTargettedBrowserVersion = minimumBrowsers[browser];
                    if (!minimumTargettedBrowserVersion) {
                        return valid;
                    }
                    if (minimumBrowserVersion === 'none' && minimumTargettedBrowserVersion) {
                        return false;
                    }
                    const newer = !isOlder(minimumTargettedBrowserVersion, minimumBrowserVersion);
                    return valid && newer;
                }, true);
                maxVersion = validates ? normalizeScriptTarget(version) : maxVersion;
            });
            return maxVersion;
        };
        const browserslistConfigExists = () => {
            let browserslistFolder;
            try {
                browserslistFolder = (0, utils_1.findPackageRoot)(__dirname, '.browserslistrc');
            }
            catch (e) {
                browserslistFolder = null;
            }
            if (browserslistFolder) {
                return true;
            }
            let packageJsonFolder;
            try {
                packageJsonFolder = (0, utils_1.findPackageRoot)(__dirname, 'package.json');
            }
            catch (e) {
                packageJsonFolder = null;
            }
            if (packageJsonFolder) {
                const packageJson = require(path.join(packageJsonFolder, 'package.json'));
                return !!packageJson.browserslist;
            }
            return false;
        };
        const validate = (evt) => {
            const { config, getLocation, mergedConfig, originalConfig, resource } = evt;
            const { targetedBrowsers } = context;
            if (!browserslistConfigExists()) {
                return;
            }
            const target = normalizeScriptTarget(config.compilerOptions.target);
            const minimumBrowsers = toMiniumBrowser(targetedBrowsers);
            const messageName = 'target';
            const propertyPath = 'compilerOptions.target';
            const maxESVersion = getMaxVersion(minimumBrowsers);
            if (maxESVersion !== target) {
                const location = (0, config_checker_1.findLocation)(propertyPath, mergedConfig, originalConfig, getLocation);
                const message = (0, i18n_import_1.getMessage)(messageName, context.language, [maxESVersion, target]);
                context.report(resource, message, {
                    location,
                    severity: utils_types_1.Severity.warning
                });
            }
        };
        context.on('parse::end::typescript-config', validate);
    }
}
exports.default = TypeScriptConfigTarget;
TypeScriptConfigTarget.meta = target_1.default;
