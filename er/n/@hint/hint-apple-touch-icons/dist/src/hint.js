"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const image_size_1 = require("image-size");
const utils_string_1 = require("@hint/utils-string");
const utils_network_1 = require("@hint/utils-network");
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
const recommendedSizes = [
    '120x120',
    '152x152',
    '167x167',
    '180x180'
];
class AppleTouchIconsHint {
    constructor(context) {
        const getAppleTouchIcons = (elements) => {
            return elements.filter((element) => {
                const relValue = element.getAttribute('rel');
                if (relValue === null) {
                    return false;
                }
                const relValues = (0, utils_string_1.normalizeString)(relValue).split(' ');
                return relValues.includes('apple-touch-icon') || relValues.includes('apple-touch-icon-precomposed');
            });
        };
        const getImage = async (appleTouchIcon, resource) => {
            const appleTouchIconHref = (0, utils_string_1.normalizeString)(appleTouchIcon.getAttribute('href'));
            if (!appleTouchIconHref) {
                const message = (0, i18n_import_1.getMessage)('noEmptyHref', context.language);
                context.report(resource, message, { element: appleTouchIcon, severity: utils_types_1.Severity.error });
                return null;
            }
            if (!(0, utils_network_1.isRegularProtocol)(resource)) {
                return null;
            }
            const appleTouchIconURL = appleTouchIcon.resolveUrl(appleTouchIconHref);
            let networkData;
            try {
                networkData = await context.fetchContent(appleTouchIconURL);
            }
            catch (e) {
                debug(`Failed to fetch the ${appleTouchIconHref} file`);
                const message = (0, i18n_import_1.getMessage)('couldNotBeFetch', context.language);
                context.report(resource, message, { element: appleTouchIcon, severity: utils_types_1.Severity.error });
                return null;
            }
            const response = networkData.response;
            if (response.statusCode !== 200) {
                const message = (0, i18n_import_1.getMessage)('couldNotBeFetchErrorStatusCode', context.language, response.statusCode.toString());
                context.report(resource, message, { element: appleTouchIcon, severity: utils_types_1.Severity.error });
                return null;
            }
            let image;
            try {
                image = (0, image_size_1.imageSize)(response.body.rawContent);
            }
            catch (e) {
                if (e instanceof TypeError) {
                    const message = (0, i18n_import_1.getMessage)('invalidPNG', context.language);
                    context.report(resource, message, { element: appleTouchIcon, severity: utils_types_1.Severity.error });
                }
                else {
                    debug(`'getImageData' failed for '${appleTouchIconURL}'`);
                }
                return null;
            }
            return image;
        };
        const checkImage = (image, someRecommended, resource) => {
            if (image.data.type !== 'png') {
                const message = (0, i18n_import_1.getMessage)('shouldBePNG', context.language);
                context.report(resource, message, { element: image.element, severity: utils_types_1.Severity.error });
            }
            const sizeString = `${image.data.width}x${image.data.height}`;
            if (!recommendedSizes.includes(sizeString)) {
                const message = (0, i18n_import_1.getMessage)('wrongResolution', context.language, recommendedSizes.toString());
                context.report(resource, message, { element: image.element, severity: someRecommended ? utils_types_1.Severity.warning : utils_types_1.Severity.error });
            }
        };
        const validate = async ({ resource }) => {
            const pageDOM = context.pageDOM;
            const appleTouchIcons = getAppleTouchIcons(pageDOM.querySelectorAll('link'));
            const linksToManifest = pageDOM.querySelectorAll('link[rel="manifest"]').length > 0;
            if (appleTouchIcons.length === 0) {
                if (linksToManifest) {
                    context.report(resource, (0, i18n_import_1.getMessage)('noElement', context.language), { severity: utils_types_1.Severity.error });
                }
                return;
            }
            const images = [];
            for (const appleTouchIcon of appleTouchIcons) {
                if ((0, utils_string_1.normalizeString)(appleTouchIcon.getAttribute('rel')) !== 'apple-touch-icon') {
                    const message = (0, i18n_import_1.getMessage)('wrongRelAttribute', context.language);
                    context.report(resource, message, { element: appleTouchIcon, severity: utils_types_1.Severity.warning });
                }
                const image = await getImage(appleTouchIcon, resource);
                if (image) {
                    images.push({
                        data: image,
                        element: appleTouchIcon
                    });
                }
            }
            const someRecommended = images.some(({ data }) => {
                const sizeString = `${data.width}x${data.height}`;
                return recommendedSizes.includes(sizeString);
            });
            for (const image of images) {
                checkImage(image, someRecommended, resource);
            }
            const bodyAppleTouchIcons = getAppleTouchIcons(pageDOM.querySelectorAll('body link'));
            for (const icon of bodyAppleTouchIcons) {
                const message = (0, i18n_import_1.getMessage)('elementNotInHead', context.language);
                context.report(resource, message, { element: icon, severity: utils_types_1.Severity.error });
            }
            const iconsHref = new Set();
            for (const appleTouchIcon of appleTouchIcons) {
                const href = appleTouchIcon.getAttribute('href');
                if (!href) {
                    continue;
                }
                if (iconsHref.has(href)) {
                    const message = (0, i18n_import_1.getMessage)('elementDuplicated', context.language);
                    context.report(resource, message, { element: appleTouchIcon, severity: utils_types_1.Severity.warning });
                }
                iconsHref.add(href);
            }
        };
        context.on('traverse::end', validate);
    }
}
exports.default = AppleTouchIconsHint;
AppleTouchIconsHint.meta = meta_1.default;
