"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const forEach = require("lodash/forEach");
const groupBy = require("lodash/groupBy");
const table = require("text-table");
const stripAnsi = require('strip-ansi');
const utils_1 = require("@hint/utils");
const utils_fs_1 = require("@hint/utils-fs");
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const i18n_import_1 = require("./i18n.import");
const _ = {
    forEach,
    groupBy
};
const debug = (0, utils_debug_1.debug)(__filename);
class SummaryFormatter {
    async format(messages, options = {}) {
        debug('Formatting results');
        if (messages.length === 0) {
            return;
        }
        const tableData = [];
        const language = options.language;
        const totals = {
            [utils_types_1.Severity.error.toString()]: 0,
            [utils_types_1.Severity.warning.toString()]: 0,
            [utils_types_1.Severity.information.toString()]: 0,
            [utils_types_1.Severity.hint.toString()]: 0
        };
        const resources = _.groupBy(messages, 'hintId');
        const sortedResources = Object.entries(resources).sort(([hintA, problemsA], [hintB, problemsB]) => {
            if (problemsA.length < problemsB.length) {
                return -1;
            }
            if (problemsA.length > problemsB.length) {
                return 1;
            }
            return hintA.localeCompare(hintB);
        });
        _.forEach(sortedResources, ([hintId, problems]) => {
            const msgsBySeverity = _.groupBy(problems, 'severity');
            const errors = msgsBySeverity[utils_types_1.Severity.error] ? msgsBySeverity[utils_types_1.Severity.error].length : 0;
            const warnings = msgsBySeverity[utils_types_1.Severity.warning] ? msgsBySeverity[utils_types_1.Severity.warning].length : 0;
            const informations = msgsBySeverity[utils_types_1.Severity.information] ? msgsBySeverity[utils_types_1.Severity.information].length : 0;
            const hints = msgsBySeverity[utils_types_1.Severity.hint] ? msgsBySeverity[utils_types_1.Severity.hint].length : 0;
            const red = (0, utils_1.severityToColor)(utils_types_1.Severity.error);
            const yellow = (0, utils_1.severityToColor)(utils_types_1.Severity.warning);
            const gray = (0, utils_1.severityToColor)(utils_types_1.Severity.information);
            const pink = (0, utils_1.severityToColor)(utils_types_1.Severity.hint);
            const line = [chalk.cyan(hintId)];
            if (errors > 0) {
                line.push(red((0, i18n_import_1.getMessage)(errors === 1 ? 'errorCount' : 'errorsCount', language, errors.toString())));
            }
            if (warnings > 0) {
                line.push(yellow((0, i18n_import_1.getMessage)(warnings === 1 ? 'warningCount' : 'warningsCount', language, warnings.toString())));
            }
            if (hints > 0) {
                line.push(pink((0, i18n_import_1.getMessage)(hints === 1 ? 'hintCount' : 'hintsCount', language, hints.toString())));
            }
            if (informations > 0) {
                line.push(gray((0, i18n_import_1.getMessage)(informations === 1 ? 'informationCount' : 'informationsCount', language, informations.toString())));
            }
            tableData.push(line);
            totals[utils_types_1.Severity.error.toString()] += errors;
            totals[utils_types_1.Severity.warning.toString()] += warnings;
            totals[utils_types_1.Severity.information.toString()] += informations;
            totals[utils_types_1.Severity.hint.toString()] += hints;
        });
        const color = (0, utils_1.occurencesToColor)(totals);
        const foundTotalMessage = (0, i18n_import_1.getMessage)('totalFound', language, [
            totals[utils_types_1.Severity.error].toString(),
            totals[utils_types_1.Severity.error] === 1 ? (0, i18n_import_1.getMessage)('error', language) : (0, i18n_import_1.getMessage)('errors', language),
            totals[utils_types_1.Severity.warning].toString(),
            totals[utils_types_1.Severity.warning] === 1 ? (0, i18n_import_1.getMessage)('warning', language) : (0, i18n_import_1.getMessage)('warnings', language),
            totals[utils_types_1.Severity.hint].toString(),
            totals[utils_types_1.Severity.hint] === 1 ? (0, i18n_import_1.getMessage)('hint', language) : (0, i18n_import_1.getMessage)('hints', language),
            totals[utils_types_1.Severity.information].toString(),
            totals[utils_types_1.Severity.information] === 1 ? (0, i18n_import_1.getMessage)('information', language) : (0, i18n_import_1.getMessage)('informations', language)
        ]);
        const result = `${table(tableData)}
${color.bold(`× ${foundTotalMessage}`)}`;
        if (!options.output) {
            utils_1.logger.log(result);
            return;
        }
        await (0, utils_fs_1.writeFileAsync)(options.output, stripAnsi(result));
    }
}
exports.default = SummaryFormatter;
