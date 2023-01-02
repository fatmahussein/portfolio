"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const utils_debug_1 = require("@hint/utils-debug");
const utils_compat_data_1 = require("@hint/utils-compat-data");
const utils_network_1 = require("@hint/utils-network");
const utils_string_1 = require("@hint/utils-string");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class DisownOpenerHint {
    constructor(context) {
        let includeSameOriginURLs = false;
        const loadHintConfigs = () => {
            includeSameOriginURLs = (context.hintOptions && context.hintOptions.includeSameOriginURLs) || false;
        };
        const checkForRelValue = (resource, element, relValueToCheckFor, severity) => {
            const relValues = (0, utils_string_1.normalizeString)(element.getAttribute('rel'), '').split(' ');
            const hrefValue = (0, utils_string_1.normalizeString)(element.getAttribute('href')) || '';
            if (relValues.includes(relValueToCheckFor)) {
                return;
            }
            const message = (0, i18n_import_1.getMessage)('shouldHaveRel', context.language, relValueToCheckFor);
            context.report(resource, message, {
                content: hrefValue, element,
                severity
            });
        };
        const checkSameOrigin = (resource, element) => {
            const hrefValue = (0, utils_string_1.normalizeString)(element.getAttribute('href')) || '';
            try {
                const fullURL = new url_1.URL(hrefValue, resource).href;
                if ((new url_1.URL(resource).origin === new url_1.URL(fullURL).origin) && !includeSameOriginURLs) {
                    debug('Is same origin');
                    return false;
                }
                return true;
            }
            catch (e) {
                debug(e);
                return true;
            }
        };
        const hasHrefValue = (element) => {
            if ((0, utils_string_1.normalizeString)(element.getAttribute('href')) !== null) {
                return true;
            }
            debug(`'href' is not specified`);
            return false;
        };
        const elementHrefHasRequiredProtocol = (element) => {
            const hrefValue = element.getAttribute('href') || '';
            return (0, utils_network_1.isRegularProtocol)(hrefValue);
        };
        const hasTargetBlank = (element) => {
            if ((0, utils_string_1.normalizeString)(element.getAttribute('target')) === '_blank') {
                return true;
            }
            debug('No `target="_blank"` found');
            return false;
        };
        const validate = ({ element, resource }) => {
            if (!hasTargetBlank(element) ||
                !hasHrefValue(element) ||
                !elementHrefHasRequiredProtocol(element) ||
                !checkSameOrigin(resource, element)) {
                return;
            }
            checkForRelValue(resource, element, 'noopener', utils_types_1.Severity.error);
            if (!context.targetedBrowsers.length || !(0, utils_compat_data_1.isSupported)({ attribute: 'rel', element: element.nodeName.toLowerCase(), value: 'noopener' }, context.targetedBrowsers)) {
                checkForRelValue(resource, element, 'noreferrer', utils_types_1.Severity.warning);
            }
        };
        loadHintConfigs();
        context.on('element::a', validate);
        context.on('element::area', validate);
    }
}
exports.default = DisownOpenerHint;
DisownOpenerHint.meta = meta_1.default;
