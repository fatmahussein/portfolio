"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
const url_1 = require("url");
const utils_network_1 = require("@hint/utils-network");
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class NoFriendlyErrorPagesHint {
    constructor(context) {
        if (!['ie 5', 'ie 6', 'ie 7', 'ie 8', 'ie 9', 'ie 10', 'ie 11'].some((e) => {
            return context.targetedBrowsers.includes(e);
        })) {
            debug(`Hint does not apply for targeted browsers`);
            return;
        }
        const foundErrorPages = {};
        const statusCodesWith256Threshold = [403, 405, 410];
        const statusCodesWith512Threshold = [400, 404, 406, 408, 409, 500, 501, 505];
        const checkForErrorPages = ({ resource, response }) => {
            if ((0, utils_network_1.isDataURI)(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);
                return;
            }
            const statusCode = response.statusCode;
            const size = (response.body.rawContent || []).length;
            if (((size < 512) && statusCodesWith512Threshold.includes(statusCode)) ||
                ((size < 256) && statusCodesWith256Threshold.includes(statusCode))) {
                foundErrorPages[statusCode] = {
                    size,
                    url: response.url
                };
            }
        };
        const tryToGenerateErrorPage = async (targetURL) => {
            const baseURL = url.format(new url_1.URL(targetURL), {
                fragment: false,
                search: false
            });
            try {
                const networkData = await context.fetchContent(url.resolve(baseURL, `.well-known/${Math.random()}`));
                checkForErrorPages({
                    element: null,
                    request: networkData.request,
                    resource: targetURL,
                    response: networkData.response
                });
            }
            catch (e) {
                debug(`Custom request to generate error response failed for: ${targetURL}`);
            }
        };
        const validate = async ({ resource: href }) => {
            if (Object.keys(foundErrorPages).length === 0 || !foundErrorPages[404]) {
                await tryToGenerateErrorPage(href);
            }
            for (const key of Object.keys(foundErrorPages)) {
                const threshold = statusCodesWith512Threshold.includes(Number.parseInt(key)) ? 512 : 256;
                context.report(href, (0, i18n_import_1.getMessage)('responseWithStatus', context.language, [key, threshold.toString()]), { severity: utils_types_1.Severity.hint });
            }
        };
        context.on('fetch::end::*', checkForErrorPages);
        context.on('traverse::end', validate);
    }
}
exports.default = NoFriendlyErrorPagesHint;
NoFriendlyErrorPagesHint.meta = meta_1.default;
