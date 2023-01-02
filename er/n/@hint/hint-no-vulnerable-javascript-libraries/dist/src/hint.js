"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const util_1 = require("util");
const groupBy = require("lodash/groupBy");
const semver = require("semver");
const utils_debug_1 = require("@hint/utils-debug");
const utils_fs_1 = require("@hint/utils-fs");
const logger = require("@hint/utils/dist/src/logging");
const utils_network_1 = require("@hint/utils-network");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class NoVulnerableJavascriptLibrariesHint {
    constructor(context) {
        let minimumSeverity = 'low';
        const createScript = async () => {
            debug('Creating script to inject');
            const libraryDetector = await (0, utils_fs_1.readFileAsync)(require.resolve('js-library-detector'));
            const script = `/*RunInPageContext*/
            (function (){
                ${libraryDetector};

                const libraries = Object.entries(d41d8cd98f00b204e9800998ecf8427e_LibraryDetectorTests);
                const detectedLibraries = libraries.reduce((detected, [name, lib]) => {
                    try {
                        const result = lib.test(window);
                        if (result) {
                            detected.push({
                                name,
                                version: result.version,
                                npmPkgName: lib.npm
                            });
                        }
                    }
                    catch (e) {}

                    return detected;
                }, []);

                return detectedLibraries;
            }())`;
            return script;
        };
        const loadSnyk = async () => {
            const oneDay = 3600000 * 24;
            const now = Date.now();
            if (process.env.webpack) {
                return require('./snyk-snapshot.json');
            }
            try {
                const snykDBPath = require.resolve('./snyk-snapshot.json');
                const snykStat = await (0, util_1.promisify)(fs.stat)(snykDBPath);
                const modified = new Date(snykStat.mtime).getTime();
                if (now - modified > oneDay) {
                    debug('snkyDB is older than 24h.');
                    debug('Updating snykDB');
                    const res = await (0, utils_network_1.requestAsync)('https://snyk.io/partners/api/v2/vulndb/clientside.json');
                    await (0, utils_fs_1.writeFileAsync)(snykDBPath, res);
                }
            }
            catch (e) {
                debug(e);
                debug(`Error loading snyk's data`);
            }
            return require('./snyk-snapshot.json');
        };
        const toSeverity = (severity) => {
            switch (severity) {
                case 'high': return utils_types_1.Severity.error;
                case 'medium': return utils_types_1.Severity.warning;
                default:
                    return utils_types_1.Severity.hint;
            }
        };
        const reportLibrary = (library, vulns, resource) => {
            let vulnerabilities = vulns;
            debug('Filtering vulnerabilities');
            let maxSeverity = utils_types_1.Severity.off;
            vulnerabilities = vulnerabilities.filter((vulnerability) => {
                const { severity } = vulnerability;
                let fails = false;
                maxSeverity = Math.max(maxSeverity, toSeverity(severity));
                switch (minimumSeverity) {
                    case 'medium':
                        fails = severity === 'medium' || severity === 'high';
                        break;
                    case 'high':
                        fails = severity === 'high';
                        break;
                    default:
                        fails = true;
                        break;
                }
                return fails;
            });
            if (vulnerabilities.length === 0) {
                return;
            }
            const vulnerabilitiesBySeverity = groupBy(vulnerabilities, 'severity');
            const detail = Object.entries(vulnerabilitiesBySeverity).map(([severity, entries]) => {
                return `${entries.length} ${severity}`;
            })
                .join(', ');
            if (detail) {
                let message;
                if (vulnerabilities.length === 1) {
                    message = (0, i18n_import_1.getMessage)('vulnerability', context.language, [`${library.name}@${library.version}`, vulnerabilities.length.toString(), detail]);
                }
                else {
                    message = (0, i18n_import_1.getMessage)('vulnerabilities', context.language, [`${library.name}@${library.version}`, vulnerabilities.length.toString(), detail]);
                }
                const documentation = vulnerabilities.map((vuln) => {
                    return {
                        link: `https://snyk.io/vuln/${vuln.id}`,
                        text: (0, i18n_import_1.getMessage)('learnMore', context.language, [vuln.id, vuln.severity])
                    };
                });
                context.report(resource, message, {
                    documentation,
                    severity: maxSeverity
                });
            }
        };
        const removeTagsFromVersion = (version) => {
            const match = (/(\d+\.?)+/).exec(version);
            return match && match[0];
        };
        const detectAndReportVulnerableLibraries = async (libraries, resource) => {
            const snykDB = await loadSnyk();
            for (const lib of libraries) {
                const snykInfo = snykDB.npm[lib.npmPkgName];
                if (!snykInfo) {
                    continue;
                }
                const vulnerabilities = snykInfo.reduce((vulns, vuln) => {
                    const version = removeTagsFromVersion(lib.version) || '';
                    try {
                        vuln.semver.vulnerable.forEach((vulnVersion) => {
                            if (semver.satisfies(version, vulnVersion)) {
                                vulns.push(vuln);
                            }
                        });
                    }
                    catch (e) {
                        logger.error((0, i18n_import_1.getMessage)('versionNotCompliant', context.language, [version, lib.name]));
                    }
                    return vulns;
                }, []);
                reportLibrary(lib, vulnerabilities, resource);
            }
        };
        const validateLibraries = async (canEvaluateScript) => {
            const script = await createScript();
            const resource = canEvaluateScript.resource;
            let detectedLibraries;
            try {
                detectedLibraries = (await context.evaluate(script));
            }
            catch (e) {
                let message;
                const err = e;
                if (err.message.includes('evaluation exceeded')) {
                    message = (0, i18n_import_1.getMessage)('notFastEnough', context.language);
                }
                else {
                    message = (0, i18n_import_1.getMessage)('errorExecuting', context.language, err.message);
                }
                message = (0, i18n_import_1.getMessage)('tryAgainLater', context.language, message);
                context.report(resource, message, { severity: utils_types_1.Severity.warning });
                debug('Error executing script', e);
                return;
            }
            if (detectedLibraries.length === 0) {
                return;
            }
            await detectAndReportVulnerableLibraries(detectedLibraries, canEvaluateScript.resource);
            return;
        };
        minimumSeverity = (context.hintOptions && context.hintOptions.severity) || 'low';
        context.on('can-evaluate::script', validateLibraries);
    }
}
exports.default = NoVulnerableJavascriptLibrariesHint;
NoVulnerableJavascriptLibrariesHint.meta = meta_1.default;
