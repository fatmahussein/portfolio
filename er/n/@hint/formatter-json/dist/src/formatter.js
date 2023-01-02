"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const groupBy = require("lodash/groupBy");
const reduce = require("lodash/reduce");
const sortBy = require("lodash/sortBy");
const utils_1 = require("@hint/utils");
const utils_fs_1 = require("@hint/utils-fs");
const utils_debug_1 = require("@hint/utils-debug");
const i18n_import_1 = require("./i18n.import");
const _ = {
    groupBy,
    reduce,
    sortBy
};
const debug = (0, utils_debug_1.debug)(__filename);
class JSONFormatter {
    async format(messages, options = {}) {
        debug('Formatting results');
        if (messages.length === 0) {
            return;
        }
        const language = options.language;
        const resources = _.groupBy(messages, 'resource');
        const result = _.reduce(resources, (total, msgs, resource) => {
            const sortedMessages = _.sortBy(msgs, ['location.line', 'location.column']);
            const result = `${total ? '\n\n' : ''}${resource}: ${(0, i18n_import_1.getMessage)('issues', language, msgs.length.toString())}
${JSON.stringify(sortedMessages, null, 2)}`;
            return total + result;
        }, '');
        if (!options.output) {
            utils_1.logger.log(result);
            return;
        }
        await (0, utils_fs_1.writeFileAsync)(options.output, result);
    }
}
exports.default = JSONFormatter;
