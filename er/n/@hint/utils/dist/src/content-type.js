"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTextMediaType = exports.getType = exports.getFileExtension = exports.getContentTypeData = exports.determineMediaTypeForScript = exports.determineMediaTypeBasedOnFileName = exports.determineMediaTypeBasedOnFileExtension = void 0;
const file_type_1 = require("file-type");
const is_svg_1 = require("is-svg");
const content_type_1 = require("content-type");
const utils_debug_1 = require("@hint/utils-debug");
const mime_db_1 = require("./mime-db");
const utils_fs_1 = require("@hint/utils-fs");
Object.defineProperty(exports, "getFileExtension", { enumerable: true, get: function () { return utils_fs_1.fileExtension; } });
const utils_string_1 = require("@hint/utils-string");
const debug = (0, utils_debug_1.debug)(__filename);
const getMediaTypeBasedOnFileExtension = (fileExtension) => {
    return fileExtension && Object.keys(mime_db_1.default).find((key) => {
        return !!mime_db_1.default[key].extensions && mime_db_1.default[key].extensions.includes(fileExtension);
    }) || null;
};
const determineCharset = (originalCharset, mediaType) => {
    const charsetAliases = new Map([
        ['iso-8859-1', 'latin1']
    ]);
    const defaultCharset = originalCharset && charsetAliases.get(originalCharset) || originalCharset;
    const typeInfo = mime_db_1.default[mediaType || ''];
    let determinedCharset = typeInfo && (0, utils_string_1.normalizeString)(typeInfo.charset);
    if (defaultCharset && (determinedCharset === defaultCharset)) {
        return defaultCharset;
    }
    if (!isTextMediaType(mediaType || '')) {
        return null;
    }
    determinedCharset = determinedCharset || 'utf-8';
    return defaultCharset ? defaultCharset : determinedCharset;
};
const determineMediaTypeForScript = (element) => {
    const typeAttribute = (0, utils_string_1.normalizeString)(element.getAttribute('type') || '');
    const validJavaScriptMediaTypes = [
        'application/ecmascript',
        'application/javascript',
        'application/x-ecmascript',
        'application/x-javascript',
        'text/ecmascript',
        'text/javascript',
        'text/javascript1.0',
        'text/javascript1.1',
        'text/javascript1.2',
        'text/javascript1.3',
        'text/javascript1.4',
        'text/javascript1.5',
        'text/jscript',
        'text/livescript',
        'text/x-ecmascript',
        'text/x-javascript'
    ];
    if (!typeAttribute ||
        validJavaScriptMediaTypes.includes(typeAttribute) ||
        typeAttribute === 'module') {
        return 'text/javascript';
    }
    return null;
};
exports.determineMediaTypeForScript = determineMediaTypeForScript;
const determineMediaTypeBasedOnElement = (element) => {
    const nodeName = element && (0, utils_string_1.normalizeString)(element.nodeName);
    if (element && nodeName) {
        if (nodeName === 'script') {
            return determineMediaTypeForScript(element);
        }
        if (nodeName === 'link') {
            const relValue = element.getAttribute('rel');
            switch (relValue) {
                case 'stylesheet':
                    return 'text/css';
                case 'manifest':
                    return 'application/manifest+json';
            }
        }
    }
    return null;
};
const determineMediaTypeBasedOnFileExtension = (resource, originalMediaType = null) => {
    const fileExtension = (0, utils_fs_1.fileExtension)(resource);
    if (!fileExtension) {
        return null;
    }
    switch (fileExtension) {
        case 'html':
        case 'htm':
            return 'text/html';
        case 'php':
            if (originalMediaType) {
                return 'text/html';
            }
            break;
        case 'xhtml':
            return 'application/xhtml+xml';
        case 'js':
            return 'text/javascript';
        case 'ts':
        case 'tsx':
            return 'text/x-typescript';
        case 'css':
            return 'text/css';
        case 'ico':
            return 'image/x-icon';
        case 'webmanifest':
            return 'application/manifest+json';
        case 'jpeg':
        case 'jpg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'svg':
            return 'image/svg+xml';
        case 'webp':
            return 'image/webp';
        case 'woff2':
            return 'font/woff2';
        case 'woff':
            return 'font/woff';
        case 'ttf':
            return 'font/ttf';
        case 'otf':
            return 'font/otf';
        case 'xml':
            return 'text/xml';
    }
    return getMediaTypeBasedOnFileExtension(fileExtension);
};
exports.determineMediaTypeBasedOnFileExtension = determineMediaTypeBasedOnFileExtension;
const determineMediaTypeBasedOnFileName = (resource, rawContent) => {
    const fileName = (0, utils_fs_1.fileName)(resource);
    if (!fileName) {
        return null;
    }
    const configFileNameRegex = /^\.[a-z0-9]+rc$/i;
    if (!configFileNameRegex.test(fileName)) {
        return null;
    }
    try {
        JSON.parse(rawContent.toString());
    }
    catch (err) {
        return 'text/plain';
    }
    return 'text/json';
};
exports.determineMediaTypeBasedOnFileName = determineMediaTypeBasedOnFileName;
const determineMediaTypeBasedOnFileType = async (rawContent) => {
    if (!rawContent) {
        return null;
    }
    const detectedFileType = await (0, file_type_1.fromBuffer)(rawContent);
    if (detectedFileType) {
        if (detectedFileType.mime === 'application/xml' &&
            (0, is_svg_1.default)(rawContent)) {
            return 'image/svg+xml';
        }
        return determineMediaTypeBasedOnFileExtension(detectedFileType.ext);
    }
    return null;
};
const getPreferedMediaType = (mediaType) => {
    switch (mediaType) {
        case 'application/xml':
            return 'text/xml';
        default:
            return mediaType;
    }
};
const parseContentTypeHeader = (headers) => {
    const contentTypeHeaderValue = (0, utils_string_1.normalizeString)(headers ? headers['content-type'] : null);
    if (contentTypeHeaderValue === null) {
        debug(`'content-type' header was not specified`);
        return null;
    }
    let contentType;
    try {
        if (contentTypeHeaderValue === '') {
            throw new TypeError('invalid media type');
        }
        contentType = (0, content_type_1.parse)(contentTypeHeaderValue);
    }
    catch (e) {
        debug(`'content-type' header value is invalid (${e.message})`);
        return null;
    }
    return contentType;
};
const getContentTypeData = async (element, resource, headers, rawContent) => {
    let originalMediaType = null;
    let originalCharset = null;
    const contentType = parseContentTypeHeader(headers);
    if (contentType) {
        originalCharset = contentType.parameters ? contentType.parameters.charset : null;
        originalMediaType = contentType.type;
    }
    let mediaType = determineMediaTypeBasedOnElement(element) ||
        await determineMediaTypeBasedOnFileType(rawContent) ||
        determineMediaTypeBasedOnFileExtension(resource, originalMediaType) ||
        determineMediaTypeBasedOnFileName(resource, rawContent) ||
        originalMediaType;
    mediaType = getPreferedMediaType(mediaType);
    const charset = determineCharset(originalCharset, mediaType);
    return {
        charset,
        mediaType
    };
};
exports.getContentTypeData = getContentTypeData;
const isTextMediaType = (mediaType) => {
    const textMediaTypes = [
        /application\/(?:javascript|json|x-javascript|xml)/i,
        /application\/.*\+(?:json|xml)/i,
        /image\/svg\+xml/i,
        /text\/.*/i
    ];
    if (textMediaTypes.some((regex) => {
        return regex.test(mediaType);
    })) {
        return true;
    }
    return false;
};
exports.isTextMediaType = isTextMediaType;
const getType = (mediaType) => {
    if (!mediaType) {
        return 'unknown';
    }
    if (mediaType.startsWith('image')) {
        return 'image';
    }
    if (mediaType.startsWith('font') || mediaType === 'application/vnd.ms-fontobject') {
        return 'font';
    }
    switch (mediaType) {
        case 'application/javascript':
        case 'text/javascript':
            return 'script';
        case 'text/css':
            return 'css';
        case 'application/json':
        case 'text/json':
            return 'json';
        case 'application/manifest+json':
            return 'manifest';
        case 'text/html':
        case 'application/xhtml+xml':
            return 'html';
        case 'text/xml':
            return 'xml';
        case 'text/plain':
            return 'txt';
    }
    return 'unknown';
};
exports.getType = getType;
