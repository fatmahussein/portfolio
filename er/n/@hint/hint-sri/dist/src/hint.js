"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const url_1 = require("url");
const utils_debug_1 = require("@hint/utils-debug");
const utils_string_1 = require("@hint/utils-string");
const utils_network_1 = require("@hint/utils-network");
const utils_types_1 = require("@hint/utils-types");
const types_1 = require("./types");
const meta_1 = require("./meta");
const i18n_import_1 = require("./i18n.import");
const debug = (0, utils_debug_1.debug)(__filename);
class SRIHint {
    constructor(context) {
        this.origin = '';
        this.finalUrl = '';
        this.baseline = 'sha384';
        this.originCriteria = 'crossOrigin';
        this.cache = new Map();
        this.reportedKeys = new Set();
        this.context = context;
        if (context.hintOptions) {
            this.baseline = context.hintOptions.baseline || this.baseline;
            this.originCriteria = context.hintOptions.originCriteria || this.originCriteria;
        }
        context.on('fetch::end::script', (evt) => {
            this.validateResource(evt, {
                final: this.finalUrl,
                origin: this.origin
            });
        });
        context.on('fetch::end::css', (evt) => {
            this.validateResource(evt, {
                final: this.finalUrl,
                origin: this.origin
            });
        });
        context.on('element::script', this.validateElement.bind(this));
        context.on('element::link', this.validateElement.bind(this));
        context.on('fetch::end::html', this.setOrigin.bind(this));
        context.on('scan::end', this.onScanEnd.bind(this));
    }
    calculateHash(content, sha) {
        const hash = crypto
            .createHash(sha)
            .update(content)
            .digest('base64');
        return hash;
    }
    isScriptOrLink(evt) {
        debug('Is <script> or <link>?');
        const { element } = evt;
        if (!element) {
            return false;
        }
        const nodeName = (0, utils_string_1.normalizeString)(element.nodeName);
        if (nodeName === 'script') {
            return !!element.getAttribute('src');
        }
        if (nodeName === 'link') {
            const relValues = ((0, utils_string_1.normalizeString)(element.getAttribute('rel'), '')).split(' ');
            return relValues.includes('stylesheet');
        }
        return false;
    }
    report(resource, message, options, evt) {
        const errorData = {
            message,
            options,
            resource
        };
        const cacheKey = this.getCacheKey(evt);
        const cacheErrors = this.getCache(evt);
        cacheErrors.push(errorData);
        this.reportedKeys.add(cacheKey);
        this.context.report(errorData.resource, errorData.message, errorData.options);
    }
    isEligibleForIntegrityValidation(evt, urls) {
        debug('Is eligible for integrity validation?');
        const { element, resource } = evt;
        const resourceOrigin = new url_1.URL(resource).origin;
        if (urls.origin === resourceOrigin) {
            return true;
        }
        const crossorigin = (0, utils_string_1.normalizeString)(element && element.getAttribute('crossorigin'));
        if (!crossorigin) {
            const message = (0, i18n_import_1.getMessage)('crossoriginNeeded', this.context.language);
            this.report(urls.final, message, { element, severity: utils_types_1.Severity.error }, evt);
            return false;
        }
        const validCrossorigin = crossorigin === 'anonymous' || crossorigin === 'use-credentials';
        if (!validCrossorigin) {
            const message = (0, i18n_import_1.getMessage)('crossoriginInvalid', this.context.language);
            this.report(urls.final, message, { element, severity: utils_types_1.Severity.error }, evt);
        }
        return validCrossorigin;
    }
    hasIntegrityAttribute(evt, urls) {
        debug('has integrity attribute?');
        const { element, resource } = evt;
        const integrity = element && element.getAttribute('integrity');
        const resourceOrigin = new url_1.URL(resource).origin;
        const integrityRequired = types_1.OriginCriteria[this.originCriteria] === types_1.OriginCriteria.all ||
            urls.origin !== resourceOrigin;
        if (integrityRequired && !integrity) {
            const message = (0, i18n_import_1.getMessage)('noIntegrity', this.context.language);
            this.report(urls.final, message, { element, severity: utils_types_1.Severity.warning }, evt);
        }
        return !!integrity;
    }
    isIntegrityFormatValid(evt, urls) {
        debug('Is integrity attribute valid?');
        const { element } = evt;
        const integrity = element && element.getAttribute('integrity');
        const integrityRegExp = /^sha(256|384|512)-/;
        const integrityValues = integrity ? integrity.split(/\s+/) : [];
        let highestAlgorithmPriority = 0;
        const that = this;
        const areFormatsValid = integrityValues.every((integrityValue) => {
            const results = integrityRegExp.exec(integrityValue);
            const isValid = Array.isArray(results);
            if (!isValid) {
                const message = (0, i18n_import_1.getMessage)('invalidIntegrity', this.context.language);
                that.report(urls.final, message, { element, severity: utils_types_1.Severity.error }, evt);
                return false;
            }
            const algorithm = `sha${results[1]}`;
            const algorithmPriority = types_1.Algorithms[algorithm];
            highestAlgorithmPriority = Math.max(algorithmPriority, highestAlgorithmPriority);
            return true;
        });
        if (!areFormatsValid) {
            return false;
        }
        const baseline = types_1.Algorithms[this.baseline];
        const meetsBaseline = highestAlgorithmPriority >= baseline;
        if (!meetsBaseline) {
            const message = (0, i18n_import_1.getMessage)('algorithmNotMeetBaseline', this.context.language, [types_1.Algorithms[highestAlgorithmPriority], this.baseline]);
            this.report(urls.final, message, { element, severity: utils_types_1.Severity.warning }, evt);
        }
        return meetsBaseline;
    }
    isSecureContext(evt, urls) {
        debug('Is delivered on a secure context?');
        const { element, resource } = evt;
        const protocol = new url_1.URL(resource).protocol;
        const isSecure = protocol === 'https:';
        if (!isSecure) {
            const message = (0, i18n_import_1.getMessage)('resourceNotSecure', this.context.language);
            this.report(urls.final, message, { element, severity: utils_types_1.Severity.error }, evt);
        }
        return isSecure;
    }
    hasRightHash(evt, urls) {
        debug('Does it have the right hash?');
        const { element, response } = evt;
        const integrity = element && element.getAttribute('integrity');
        const integrities = integrity ? integrity.split(/\s+/) : [];
        const calculatedHashes = new Map();
        const isOK = integrities.some((integrityValue) => {
            const integrityRegExp = /^sha(256|384|512)-(.*)$/;
            const [, bits = '', hash = ''] = integrityRegExp.exec(integrityValue) || [];
            const calculatedHash = calculatedHashes.has(bits) ?
                calculatedHashes.get(bits) :
                this.calculateHash(response.body.content, `sha${bits}`);
            calculatedHashes.set(bits, calculatedHash);
            return hash === calculatedHash;
        });
        if (!isOK) {
            const hashes = [];
            calculatedHashes.forEach((value, key) => {
                hashes.push(`sha${key}-${value}`);
            });
            const message = (0, i18n_import_1.getMessage)('hashDoesNotMatch', this.context.language);
            this.report(urls.final, message, { element, severity: utils_types_1.Severity.error }, evt);
        }
        return isOK;
    }
    getCache(evt) {
        const key = this.getCacheKey(evt);
        if (!this.cache.has(key)) {
            this.cache.set(key, []);
        }
        return this.cache.get(key);
    }
    getCacheKey(evt) {
        const { element, resource } = evt;
        if (!element) {
            return '';
        }
        const integrity = element.getAttribute('integrity');
        return `${resource}${integrity}`;
    }
    addToCache(evt) {
        const { element, resource } = evt;
        if (!element) {
            return false;
        }
        const integrity = element.getAttribute('integrity');
        const key = `${resource}${integrity}`;
        if (!this.cache.has(key)) {
            this.cache.set(key, []);
        }
        return true;
    }
    isNotLocalResource(evt) {
        const { resource } = evt;
        if (resource.startsWith('file://')) {
            debug(`Ignoring local resource: ${resource}`);
            return false;
        }
        return true;
    }
    isInCache(evt) {
        const cacheKey = this.getCacheKey(evt);
        const isInCache = this.cache.has(cacheKey);
        if (isInCache && !this.reportedKeys.has(cacheKey)) {
            this.getCache(evt).forEach((error) => {
                this.context.report(error.resource, error.message, error.options);
            });
            this.reportedKeys.add(cacheKey);
            return false;
        }
        return !isInCache;
    }
    async downloadContent(evt, urls) {
        const { resource, response, element } = evt;
        if (!utils_network_1.requestAsync && !response.body.content) {
            return false;
        }
        if (!utils_network_1.requestAsync) {
            return true;
        }
        if (response.body.content) {
            return true;
        }
        try {
            response.body.content = await (0, utils_network_1.requestAsync)(resource, {
                headers: { 'content-encoding': 'gzip' },
                method: 'GET',
                rejectUnauthorized: false
            });
            return true;
        }
        catch (e) {
            debug(`Error accessing ${resource}. ${JSON.stringify(e)}`);
            this.context.report(urls.final, (0, i18n_import_1.getMessage)('canNotGetResource', this.context.language), { element, severity: utils_types_1.Severity.error });
            return false;
        }
    }
    isNotIgnored(evt) {
        return !this.context.isUrlIgnored(evt.resource);
    }
    async validateResource(evt, urls) {
        const validations = [
            this.isNotIgnored,
            this.isInCache,
            this.addToCache,
            this.isScriptOrLink,
            this.isNotLocalResource,
            this.isEligibleForIntegrityValidation,
            this.hasIntegrityAttribute,
            this.isIntegrityFormatValid,
            this.isSecureContext,
            this.downloadContent,
            this.hasRightHash
        ].map((fn) => {
            return fn.bind(this);
        });
        debug(`Validating integrity of: ${evt.resource}`);
        for (const validation of validations) {
            const valid = await validation(evt, urls);
            if (!valid) {
                break;
            }
        }
    }
    async validateElement(evt) {
        const isScriptOrLink = await this.isScriptOrLink(evt);
        if (!isScriptOrLink) {
            return;
        }
        const finalUrl = evt.resource;
        const origin = new url_1.URL(evt.resource).origin;
        const elementUrl = evt.element.getAttribute('src') || evt.element.getAttribute('href');
        evt.resource = evt.element.resolveUrl(elementUrl);
        const content = {
            request: {},
            response: { body: { content: '' } }
        };
        await this.validateResource(Object.assign(Object.assign({}, evt), { request: content.request, response: content.response }), {
            final: finalUrl,
            origin
        });
    }
    setOrigin(evt) {
        const { resource } = evt;
        this.origin = new url_1.URL(resource).origin;
        this.finalUrl = resource;
    }
    onScanEnd() {
        this.reportedKeys.clear();
    }
}
exports.default = SRIHint;
SRIHint.meta = meta_1.default;
