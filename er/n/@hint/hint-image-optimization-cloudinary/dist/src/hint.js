"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const path = require("path");
const os_1 = require("os");
const fs = require("fs-extra");
const image_size_1 = require("image-size");
const utils_1 = require("@hint/utils");
const utils_string_1 = require("@hint/utils-string");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
class ImageOptimizationCloudinaryHint {
    constructor(context) {
        const cloudinary = require('cloudinary');
        let uploads = [];
        let configured = false;
        let sizeThreshold = 5;
        const processImage = async (data) => {
            const hash = crypto
                .createHash('md5')
                .update(data.response.body.rawContent)
                .digest('hex');
            const tempPath = path.join((0, os_1.tmpdir)(), 'hint-cloudinary', hash);
            try {
                await fs.ensureFile(tempPath);
                await fs.writeFile(tempPath, data.response.body.rawContent);
                const result = await cloudinary.v2.uploader.upload(tempPath, { crop: 'limit', public_id: hash, quality: 'auto' });
                result.originalBytes = data.response.body.rawContent.length;
                result.originalUrl = data.resource;
                result.element = data.element;
                await fs.remove(tempPath);
                return result;
            }
            catch (error) {
                utils_1.logger.error((0, i18n_import_1.getMessage)('errorProcessingImage', context.language, (0, utils_string_1.cutString)(data.resource)));
                utils_1.logger.error(error);
                return null;
            }
        };
        const isConfigured = (hintOptions) => {
            const cloudinaryUrl = process.env.CLOUDINARY_URL;
            const { apiKey, apiSecret, cloudName, threshold } = hintOptions;
            if (threshold) {
                sizeThreshold = threshold;
            }
            if (cloudinaryUrl) {
                return true;
            }
            if (!apiKey || !apiSecret || !cloudName) {
                utils_1.logger.error((0, i18n_import_1.getMessage)('noConfigFound', context.language));
                return false;
            }
            cloudinary.v2.config({
                api_key: apiKey,
                api_secret: apiSecret,
                cloud_name: cloudName
            });
            return true;
        };
        const analyzeImage = (fetchEnd) => {
            if (!configured) {
                return;
            }
            const { response } = fetchEnd;
            try {
                (0, image_size_1.imageSize)(response.body.rawContent);
                uploads.push(processImage(fetchEnd));
            }
            catch (e) {
                if (e instanceof TypeError) {
                }
            }
        };
        const end = async (data) => {
            if (!configured) {
                context.report('', (0, i18n_import_1.getMessage)('noValidConfig', context.language), { severity: utils_types_1.Severity.error });
                return;
            }
            const results = await Promise.all(uploads);
            const unoptimized = results.filter((result) => {
                if (!result) {
                    return false;
                }
                return result.bytes < result.originalBytes;
            });
            let reported = false;
            let totalSavings = 0;
            for (const file of unoptimized) {
                const sizeDiff = (file.originalBytes - file.bytes) / 1000;
                const percentageDiff = Math.round((1 - (file.bytes / file.originalBytes)) * 100);
                totalSavings += sizeDiff;
                if (sizeDiff >= sizeThreshold) {
                    reported = true;
                    context.report(file.originalUrl, (0, i18n_import_1.getMessage)('imageCouldBeSmaller', context.language, [(0, utils_string_1.cutString)(file.originalUrl), sizeDiff.toFixed(2), percentageDiff.toString()]), {
                        element: file.element,
                        severity: utils_types_1.Severity.warning
                    });
                }
            }
            if (!reported && totalSavings > sizeThreshold) {
                context.report('', (0, i18n_import_1.getMessage)('totalSize', context.language, [data.resource, totalSavings.toFixed(0)]), { severity: utils_types_1.Severity.warning });
            }
            uploads = [];
        };
        configured = isConfigured(context.hintOptions || { apiKey: '', apiSecret: '', cloudName: '', threshold: 0 });
        context.on('fetch::end::*', analyzeImage);
        context.on('scan::end', end);
    }
}
exports.default = ImageOptimizationCloudinaryHint;
ImageOptimizationCloudinaryHint.meta = meta_1.default;
