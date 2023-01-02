"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("hint/dist/src/lib/types");
const utils_string_1 = require("@hint/utils-string");
const utils_network_1 = require("@hint/utils-network");
const utils_json_1 = require("@hint/utils-json");
__exportStar(require("./types"), exports);
const schema = require('./schema.json');
class ManifestParser extends types_1.Parser {
    constructor(engine) {
        super(engine, 'manifest');
        this.fetchEndEventName = 'fetch::end::manifest';
        this.fetchErrorEventName = 'fetch::error::manifest';
        this.fetchStartEventName = 'fetch::start::manifest';
        this.parseEndEventName = 'parse::end::manifest';
        this.parseErrorSchemaEventName = 'parse::error::manifest::schema';
        this.parseJSONErrorEventName = 'parse::error::manifest::json';
        this.fetchedManifests = new Set();
        engine.on('element::link', this.fetchManifest.bind(this));
        engine.on('fetch::end::manifest', this.validateManifest.bind(this));
        engine.on('scan::end', this.onScanEnd.bind(this));
    }
    onScanEnd() {
        this.fetchedManifests.clear();
    }
    async fetchManifest(elementFound) {
        const { element, resource } = elementFound;
        if (!(0, utils_network_1.isHTTP)(resource) && !(0, utils_network_1.isHTTPS)(resource)) {
            return;
        }
        if ((0, utils_string_1.normalizeString)(element.getAttribute('rel')) !== 'manifest') {
            return;
        }
        const hrefValue = (0, utils_string_1.normalizeString)(element.getAttribute('href'));
        if (!hrefValue) {
            return;
        }
        const manifestURL = element.resolveUrl(hrefValue);
        if (this.fetchedManifests.has(manifestURL)) {
            return;
        }
        await this.engine.emitAsync(this.fetchStartEventName, { resource });
        let manifestNetworkData;
        try {
            manifestNetworkData = await this.engine.fetchContent(manifestURL);
        }
        catch (error) {
            await this.engine.emitAsync(this.fetchErrorEventName, {
                element,
                error,
                hops: [manifestURL],
                resource: manifestURL
            });
            return;
        }
        if (this.fetchedManifests.has(manifestURL)) {
            return;
        }
        await this.engine.emitAsync(this.fetchEndEventName, {
            element,
            request: manifestNetworkData.request,
            resource: manifestURL,
            response: manifestNetworkData.response
        });
    }
    async validateManifest(fetchEnd) {
        const { resource, response } = fetchEnd;
        if (this.fetchedManifests.has(resource)) {
            return;
        }
        this.fetchedManifests.add(resource);
        if (response.statusCode >= 400) {
            return;
        }
        await this.engine.emitAsync(`parse::start::manifest`, { resource });
        let result;
        try {
            result = (0, utils_json_1.parseJSON)(response.body.content);
        }
        catch (e) {
            await this.engine.emitAsync(this.parseJSONErrorEventName, {
                error: e,
                resource
            });
            return;
        }
        const validationResult = (0, utils_json_1.validate)(schema, result.data, result.getLocation);
        if (!validationResult.valid) {
            await this.engine.emitAsync(this.parseErrorSchemaEventName, {
                error: new Error('Invalid manifest'),
                errors: validationResult.errors,
                groupedErrors: validationResult.groupedErrors,
                prettifiedErrors: validationResult.prettifiedErrors,
                resource
            });
            return;
        }
        await this.engine.emitAsync(this.parseEndEventName, {
            getLocation: result.getLocation,
            parsedContent: validationResult.data,
            resource
        });
    }
}
exports.default = ManifestParser;
