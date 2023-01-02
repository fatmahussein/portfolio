"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const zlib = require("zlib");
const utils_1 = require("@hint/utils");
const utils_string_1 = require("@hint/utils-string");
const utils_network_1 = require("@hint/utils-network");
const utils_types_1 = require("@hint/utils-types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const decompressBrotli = (0, util_1.promisify)(zlib.brotliDecompress);
const uaString = 'Mozilla/5.0 Gecko';
class HttpCompressionHint {
    constructor(context) {
        const getHintOptions = (property) => {
            return Object.assign({ brotli: true, gzip: true, threshold: 1024, zopfli: true }, (context.hintOptions && context.hintOptions[property]));
        };
        const resourceOptions = getHintOptions('resource');
        const htmlOptions = getHintOptions('html');
        const isBigFile = (size, options) => {
            return size > options.threshold;
        };
        const checkIfBytesMatch = (rawResponse, magicNumbers) => {
            return rawResponse && magicNumbers.every((b, i) => {
                return rawResponse[i] === b;
            });
        };
        const getHeaderValues = (headers, headerName) => {
            return ((0, utils_network_1.normalizeHeaderValue)(headers, headerName) || '').split(',');
        };
        const checkVaryHeader = (resource, headers) => {
            const varyHeaderValues = getHeaderValues(headers, 'vary');
            const cacheControlValues = getHeaderValues(headers, 'cache-control');
            if (!cacheControlValues.includes('private') &&
                !varyHeaderValues.includes('accept-encoding')) {
                let codeSnippet = '';
                if (varyHeaderValues.length > 0) {
                    codeSnippet = `Vary: ${varyHeaderValues.join(',')}\n`;
                }
                if (cacheControlValues.length > 0) {
                    codeSnippet += `Cache-Control: ${cacheControlValues.join(',')}`;
                }
                context.report(resource, (0, i18n_import_1.getMessage)('responseShouldIncludeVary', context.language), {
                    codeLanguage: 'http',
                    codeSnippet: codeSnippet.trim(),
                    severity: utils_types_1.Severity.warning
                });
            }
        };
        const generateDisallowedCompressionMessage = (encoding) => {
            return (0, i18n_import_1.getMessage)('responseShouldNotBeCompressed', context.language, encoding);
        };
        const generateContentEncodingMessage = (encoding) => {
            return (0, i18n_import_1.getMessage)('responseShouldIncludeContentEncoding', context.language, encoding);
        };
        const generateGzipCompressionMessage = (encoding) => {
            return (0, i18n_import_1.getMessage)('responseShouldBeCompressedGzip', context.language, encoding);
        };
        const generateSizeMessage = (resource, element, encoding, sizeDifference) => {
            if (sizeDifference > 0) {
                context.report(resource, (0, i18n_import_1.getMessage)('responseBiggerThan', context.language, encoding), { element, severity: utils_types_1.Severity.warning });
            }
            else {
                context.report(resource, (0, i18n_import_1.getMessage)('responseSameSize', context.language, encoding), { element, severity: utils_types_1.Severity.hint });
            }
        };
        const getNetworkData = async (resource, requestHeaders) => {
            const safeFetch = (0, utils_1.asyncTry)(context.fetchContent.bind(context));
            const networkData = await safeFetch(resource, requestHeaders);
            if (!networkData) {
                return null;
            }
            const safeRawResponse = (0, utils_1.asyncTry)(networkData.response.body.rawResponse.bind(networkData.response.body));
            const rawResponse = await safeRawResponse();
            if (!rawResponse) {
                return null;
            }
            return {
                contentEncodingHeaderValue: (0, utils_network_1.normalizeHeaderValue)(networkData.response.headers, 'content-encoding'),
                rawContent: networkData.response.body.rawContent,
                rawResponse,
                response: networkData.response
            };
        };
        const isCompressedWithBrotli = async (rawResponse) => {
            try {
                const decompressedContent = await decompressBrotli(rawResponse);
                if (decompressedContent.byteLength === 0 &&
                    rawResponse.byteLength !== 0) {
                    return false;
                }
            }
            catch (e) {
                return false;
            }
            return true;
        };
        const isCompressedWithGzip = (rawContent) => {
            return checkIfBytesMatch(rawContent, [0x1f, 0x8b]);
        };
        const isNotCompressedWithZopfli = (rawResponse) => {
            return !checkIfBytesMatch(rawResponse, [0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x03]);
        };
        const checkBrotli = async (resource, element, options) => {
            let networkData = await getNetworkData(resource, { 'Accept-Encoding': 'br' });
            if (!networkData) {
                context.report(resource, (0, i18n_import_1.getMessage)('couldNotBeFetchedBrotli', context.language), { element, severity: utils_types_1.Severity.error });
                return;
            }
            const { contentEncodingHeaderValue, rawResponse, response } = networkData;
            const compressedWithBrotli = await isCompressedWithBrotli(rawResponse);
            if ((0, utils_network_1.isHTTP)(resource)) {
                if (compressedWithBrotli) {
                    context.report(resource, (0, i18n_import_1.getMessage)('noCompressedBrotliOverHTTP', context.language), { element, severity: utils_types_1.Severity.warning });
                }
                return;
            }
            const rawContent = compressedWithBrotli ? await decompressBrotli(rawResponse) : response.body.rawContent;
            const itShouldNotBeCompressed = contentEncodingHeaderValue === 'br' &&
                rawContent.byteLength <= rawResponse.byteLength;
            if (compressedWithBrotli && itShouldNotBeCompressed) {
                generateSizeMessage(resource, element, 'Brotli', rawResponse.byteLength - rawContent.byteLength);
                return;
            }
            if (!compressedWithBrotli) {
                context.report(resource, (0, i18n_import_1.getMessage)('compressedWithBrotliOverHTTPS', context.language), { element, severity: isBigFile(rawResponse.byteLength, options) ? utils_types_1.Severity.warning : utils_types_1.Severity.hint });
                return;
            }
            checkVaryHeader(resource, response.headers);
            if (contentEncodingHeaderValue !== 'br') {
                context.report(resource, generateContentEncodingMessage('br'), { element, severity: utils_types_1.Severity.error });
            }
            networkData = await getNetworkData(resource, {
                'Accept-Encoding': 'br',
                'User-Agent': uaString
            });
            if (!networkData) {
                context.report(resource, (0, i18n_import_1.getMessage)('couldNotBeFetchedBrotli', context.language), { element, severity: utils_types_1.Severity.error });
                return;
            }
            const { rawResponse: uaRawResponse } = networkData;
            if (!(await isCompressedWithBrotli(uaRawResponse))) {
                context.report(resource, (0, i18n_import_1.getMessage)('compressedWithBrotliOverHTTPSAgent', context.language), { element, severity: utils_types_1.Severity.warning });
            }
        };
        const checkGzipZopfli = async (resource, element, shouldCheckIfCompressedWith) => {
            let networkData = await getNetworkData(resource, { 'Accept-Encoding': 'gzip' });
            if (!networkData) {
                context.report(resource, (0, i18n_import_1.getMessage)('couldNotBeFetchedGzip', context.language), { element, severity: utils_types_1.Severity.error });
                return;
            }
            const { contentEncodingHeaderValue, rawContent, rawResponse, response } = networkData;
            const compressedWithGzip = isCompressedWithGzip(rawResponse);
            const notCompressedWithZopfli = isNotCompressedWithZopfli(rawResponse);
            const itShouldNotBeCompressed = contentEncodingHeaderValue === 'gzip' &&
                rawContent.byteLength <= rawResponse.byteLength;
            if (compressedWithGzip && itShouldNotBeCompressed) {
                generateSizeMessage(resource, element, notCompressedWithZopfli ? 'gzip' : 'Zopfli', rawResponse.byteLength - rawContent.byteLength);
                return;
            }
            if (!compressedWithGzip && shouldCheckIfCompressedWith.gzip) {
                context.report(resource, generateGzipCompressionMessage('gzip'), { element, severity: isBigFile(rawResponse.byteLength, shouldCheckIfCompressedWith) ? utils_types_1.Severity.error : utils_types_1.Severity.hint });
                return;
            }
            if (notCompressedWithZopfli && shouldCheckIfCompressedWith.zopfli) {
                context.report(resource, generateGzipCompressionMessage('Zopfli'), { element, severity: utils_types_1.Severity.hint });
            }
            if (shouldCheckIfCompressedWith.gzip ||
                shouldCheckIfCompressedWith.zopfli) {
                checkVaryHeader(resource, response.headers);
                if (contentEncodingHeaderValue !== 'gzip') {
                    context.report(resource, generateContentEncodingMessage('gzip'), { element, severity: utils_types_1.Severity.error });
                }
            }
            networkData = await getNetworkData(resource, {
                'Accept-Encoding': 'gzip',
                'User-Agent': uaString
            });
            if (!networkData) {
                context.report(resource, (0, i18n_import_1.getMessage)('couldNotBeFetchedGzip', context.language), { element, severity: utils_types_1.Severity.error });
                return;
            }
            const { rawResponse: uaRawResponse } = networkData;
            if (!isCompressedWithGzip(uaRawResponse) &&
                shouldCheckIfCompressedWith.gzip) {
                context.report(resource, (0, i18n_import_1.getMessage)('compressedWithGzipAgent', context.language), { element, severity: utils_types_1.Severity.error });
                return;
            }
            if (isNotCompressedWithZopfli(uaRawResponse) &&
                !notCompressedWithZopfli &&
                shouldCheckIfCompressedWith.zopfli) {
                context.report(resource, (0, i18n_import_1.getMessage)('compressedWithZopfliAgent', context.language), { element, severity: utils_types_1.Severity.hint });
            }
        };
        const responseIsCompressed = async (rawResponse, contentEncodingHeaderValue) => {
            return isCompressedWithGzip(rawResponse) ||
                await isCompressedWithBrotli(rawResponse) ||
                (!!contentEncodingHeaderValue &&
                    (contentEncodingHeaderValue !== 'identity'));
        };
        const checkForDisallowedCompressionMethods = async (resource, element, response) => {
            const contentEncodingHeaderValue = (0, utils_network_1.normalizeHeaderValue)(response.headers, 'content-encoding');
            if (!contentEncodingHeaderValue) {
                return;
            }
            const encodings = contentEncodingHeaderValue.split(',');
            for (const encoding of encodings) {
                if (!['gzip', 'br'].includes(encoding)) {
                    const safeRawResponse = (0, utils_1.asyncTry)(response.body.rawResponse.bind(response.body));
                    const rawResponse = await safeRawResponse();
                    if (!rawResponse) {
                        context.report(resource, (0, i18n_import_1.getMessage)('couldNotBeFetched', context.language), { element, severity: utils_types_1.Severity.error });
                        return;
                    }
                    if (encoding === 'x-gzip' && isCompressedWithGzip(rawResponse)) {
                        return;
                    }
                    context.report(resource, generateDisallowedCompressionMessage(encoding), { element, severity: utils_types_1.Severity.warning });
                }
            }
            if ((0, utils_string_1.normalizeString)(response.headers['get-dictionary'])) {
                context.report(resource, generateDisallowedCompressionMessage('sdch'), { element, severity: utils_types_1.Severity.warning });
            }
        };
        const checkUncompressed = async (resource, element) => {
            const networkData = await getNetworkData(resource, { 'Accept-Encoding': 'identity' });
            if (!networkData) {
                context.report(resource, (0, i18n_import_1.getMessage)('couldNotBeFetchedUncompressed', context.language), { element, severity: utils_types_1.Severity.error });
                return;
            }
            const { contentEncodingHeaderValue, rawResponse } = networkData;
            if (await responseIsCompressed(rawResponse, contentEncodingHeaderValue)) {
                context.report(resource, (0, i18n_import_1.getMessage)('shouldNotBeCompressedWithIdentity', context.language), { element, severity: utils_types_1.Severity.warning });
            }
            if (contentEncodingHeaderValue) {
                context.report(resource, (0, i18n_import_1.getMessage)('shouldNotIncludeWithIdentity', context.language), { element, severity: utils_types_1.Severity.warning });
            }
        };
        const isCompressibleAccordingToMediaType = (mediaType) => {
            if (!mediaType) {
                return false;
            }
            const OTHER_COMMON_MEDIA_TYPES_THAT_SHOULD_BE_COMPRESSED = [
                'application/rtf',
                'application/wasm',
                'font/collection',
                'font/eot',
                'font/otf',
                'font/sfnt',
                'font/ttf',
                'image/bmp',
                'image/vnd.microsoft.icon',
                'image/x-icon',
                'x-shader/x-fragment',
                'x-shader/x-vertex'
            ];
            if ((0, utils_1.isTextMediaType)(mediaType) ||
                OTHER_COMMON_MEDIA_TYPES_THAT_SHOULD_BE_COMPRESSED.includes(mediaType)) {
                return true;
            }
            return false;
        };
        const isSpecialCase = async (resource, element, response) => {
            const safeRawResponse = (0, utils_1.asyncTry)(response.body.rawResponse.bind(response.body));
            const rawResponse = await safeRawResponse();
            if (!rawResponse) {
                context.report(resource, (0, i18n_import_1.getMessage)('couldNotBeFetched', context.language), { element, severity: utils_types_1.Severity.error });
                return false;
            }
            if ((response.mediaType === 'image/svg+xml' || (0, utils_1.getFileExtension)(resource) === 'svgz') &&
                isCompressedWithGzip(rawResponse)) {
                const headerValue = (0, utils_network_1.normalizeHeaderValue)(response.headers, 'content-encoding');
                if (headerValue !== 'gzip') {
                    context.report(resource, generateContentEncodingMessage('gzip'), {
                        codeLanguage: 'http',
                        codeSnippet: `Content-Encoding: ${headerValue}`,
                        severity: utils_types_1.Severity.error
                    });
                }
                return true;
            }
            return false;
        };
        const validate = async ({ element, resource, response }, eventName) => {
            const shouldCheckIfCompressedWith = eventName === 'fetch::end::html' ? htmlOptions : resourceOptions;
            if (response.statusCode !== 200) {
                return;
            }
            if (!(0, utils_network_1.isRegularProtocol)(resource)) {
                return;
            }
            if (await isSpecialCase(resource, element, response)) {
                return;
            }
            if (!isCompressibleAccordingToMediaType(response.mediaType)) {
                const safeRawResponse = (0, utils_1.asyncTry)(response.body.rawResponse.bind(response.body));
                const rawResponse = await safeRawResponse();
                if (!rawResponse) {
                    context.report(resource, (0, i18n_import_1.getMessage)('couldNotBeFetched', context.language), { element, severity: utils_types_1.Severity.error });
                    return;
                }
                const contentEncodingHeaderValue = (0, utils_network_1.normalizeHeaderValue)(response.headers, 'content-encoding');
                if (await responseIsCompressed(rawResponse, contentEncodingHeaderValue)) {
                    context.report(resource, (0, i18n_import_1.getMessage)('shouldNotBeCompressed', context.language), { element, severity: utils_types_1.Severity.warning });
                }
                if (contentEncodingHeaderValue) {
                    context.report(resource, (0, i18n_import_1.getMessage)('shouldNotIncludeContentEncoding', context.language), {
                        codeLanguage: 'http',
                        codeSnippet: `Content-Encoding: ${contentEncodingHeaderValue}`,
                        severity: utils_types_1.Severity.warning
                    });
                }
                return;
            }
            await checkForDisallowedCompressionMethods(resource, element, response);
            await checkUncompressed(resource, element);
            if (shouldCheckIfCompressedWith.gzip ||
                shouldCheckIfCompressedWith.zopfli) {
                await checkGzipZopfli(resource, element, shouldCheckIfCompressedWith);
            }
            if (shouldCheckIfCompressedWith.brotli) {
                await checkBrotli(resource, element, shouldCheckIfCompressedWith);
            }
        };
        context.on('fetch::end::*', validate);
    }
}
exports.default = HttpCompressionHint;
HttpCompressionHint.meta = meta_1.default;
