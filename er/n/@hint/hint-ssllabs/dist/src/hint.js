"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const api_1 = require("./api");
const types_1 = require("./types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class SSLLabsHint {
    constructor(context) {
        let promise;
        let minimumGrade = 'A-';
        let scanOptions = {
            all: 'done',
            fromCache: true,
            host: '',
            maxAge: 2
        };
        let failed = false;
        const loadHintConfig = () => {
            minimumGrade = (context.hintOptions && context.hintOptions.grade) || 'A-';
            const userSslOptions = (context.hintOptions && context.hintOptions.ssllabs) || {};
            scanOptions = Object.assign(Object.assign({}, scanOptions), userSslOptions);
        };
        const verifyEndpoint = (resource, { grade, serverName = resource, details }) => {
            if (!grade && details.protocols.length === 0) {
                const message = (0, i18n_import_1.getMessage)('doesNotSupportHTTPS', context.language, resource);
                debug(message);
                context.report(resource, message, { severity: utils_types_1.Severity.error });
                return;
            }
            const calculatedGrade = types_1.Grades[grade];
            const calculatedMiniumGrade = types_1.Grades[minimumGrade];
            if (calculatedGrade > calculatedMiniumGrade) {
                const message = (0, i18n_import_1.getMessage)('gradeNotMeetTheMinimum', context.language, [serverName, grade, minimumGrade]);
                debug(message);
                context.report(resource, message, { severity: utils_types_1.Severity.error });
            }
            else {
                debug(`Grade ${grade} for ${resource} is ok.`);
            }
        };
        const notifyError = (resource, error) => {
            debug(`Error getting data for ${resource} %O`, error);
            context.report(resource, (0, i18n_import_1.getMessage)('couldNotGetResults', context.language, resource), { severity: utils_types_1.Severity.warning });
        };
        const start = ({ resource }) => {
            if (!resource.startsWith('https://')) {
                const message = (0, i18n_import_1.getMessage)('doesNotSupportHTTPS', context.language, resource);
                debug(message);
                context.report(resource, message, { severity: utils_types_1.Severity.error });
                return;
            }
            debug(`Starting SSL Labs scan for ${resource}`);
            scanOptions.host = resource;
            promise = (0, api_1.analyze)(scanOptions);
            promise.catch((error) => {
                failed = true;
                notifyError(resource, error);
            });
        };
        const end = async ({ resource }) => {
            if (!promise || failed) {
                return;
            }
            debug(`Waiting for SSL Labs results for ${resource}`);
            let host;
            try {
                host = await promise;
            }
            catch (e) {
                notifyError(resource, e);
                return;
            }
            debug(`Received SSL Labs results for ${resource}`);
            if (!host || !host.endpoints || host.endpoints.length === 0) {
                const msg = (0, i18n_import_1.getMessage)('noResults', context.language, resource);
                debug(msg);
                context.report(resource, msg, { severity: utils_types_1.Severity.warning });
                return;
            }
            host.endpoints.forEach((endpoint) => {
                verifyEndpoint(resource, endpoint);
            });
        };
        loadHintConfig();
        context.on('fetch::end::html', start);
        context.on('scan::end', end);
    }
}
exports.default = SSLLabsHint;
SSLLabsHint.meta = meta_1.default;
