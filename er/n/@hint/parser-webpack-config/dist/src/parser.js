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
const path = require("path");
const hint_1 = require("hint");
const utils_1 = require("@hint/utils");
const utils_network_1 = require("@hint/utils-network");
__exportStar(require("./types"), exports);
class WebpackConfigParser extends hint_1.Parser {
    constructor(engine) {
        super(engine, 'webpack-config');
        this.configFound = false;
        engine.on('fetch::end::script', this.parseWebpack.bind(this));
        engine.on('scan::end', this.parseEnd.bind(this));
    }
    async parseEnd() {
        if (!this.configFound) {
            await this.engine.emitAsync('parse::error::webpack-config::not-found', {
                error: new Error('webpack.config.js was not found'),
                resource: ''
            });
        }
    }
    getLocallyInstalledWebpack() {
        try {
            const packageJSON = (0, utils_1.loadPackage)(path.join(process.cwd(), 'node_modules', 'webpack'));
            return packageJSON.version;
        }
        catch (err) {
            return null;
        }
    }
    async parseWebpack(fetchEnd) {
        const resource = fetchEnd.resource;
        const fileName = path.basename(resource);
        if (fileName !== 'webpack.config.js') {
            return;
        }
        this.configFound = true;
        await this.engine.emitAsync(`parse::start::webpack-config`, { resource });
        try {
            const config = await Promise.resolve().then(() => require((0, utils_network_1.asPathString)((0, utils_network_1.getAsUri)(resource))));
            const version = this.getLocallyInstalledWebpack();
            if (!version) {
                await this.engine.emitAsync('parse::error::webpack-config::not-install', {
                    error: new Error('webpack is not installed'),
                    resource
                });
                return;
            }
            await this.engine.emitAsync('parse::end::webpack-config', {
                config,
                resource,
                version
            });
        }
        catch (err) {
            await this.engine.emitAsync('parse::error::webpack-config::configuration', {
                error: err,
                resource
            });
        }
    }
}
exports.default = WebpackConfigParser;
