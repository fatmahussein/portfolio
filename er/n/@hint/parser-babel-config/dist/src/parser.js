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
const cloneDeep = require("lodash/cloneDeep");
const hint_1 = require("hint");
const utils_json_1 = require("@hint/utils-json");
const utils_fs_1 = require("@hint/utils-fs");
__exportStar(require("./types"), exports);
class BabelConfigParser extends hint_1.Parser {
    constructor(engine) {
        super(engine, 'babel-config');
        this.schema = (0, utils_fs_1.loadJSONFile)(path.join(__dirname, 'schema.json'));
        engine.on('fetch::end::json', this.parseBabelConfig.bind(this));
    }
    async validateSchema(config, resource, result) {
        const validationResult = (0, utils_json_1.validate)(this.schema, config, result.getLocation);
        const valid = validationResult.valid;
        if (!valid) {
            await this.engine.emitAsync('parse::error::babel-config::schema', {
                error: new Error('Invalid Babel configuration'),
                errors: validationResult.errors,
                groupedErrors: validationResult.groupedErrors,
                prettifiedErrors: validationResult.prettifiedErrors,
                resource
            });
        }
        return validationResult;
    }
    async parseBabelConfig(fetchEnd) {
        const resource = fetchEnd.resource;
        const resourceFileName = path.basename(resource);
        const isPackageJson = resourceFileName === 'package.json';
        const isBabelrc = resourceFileName === '.babelrc';
        if (!isBabelrc && !isPackageJson) {
            return;
        }
        let config;
        try {
            const response = fetchEnd.response;
            let result = (0, utils_json_1.parseJSON)(response.body.content, 'extends');
            if (isPackageJson && !result.data.babel) {
                return;
            }
            await this.engine.emitAsync('parse::start::babel-config', { resource });
            result = isPackageJson ? result.scope('babel') : result;
            config = result.data;
            const originalConfig = cloneDeep(config);
            const finalConfig = (0, utils_json_1.finalConfig)(config, resource);
            if (finalConfig instanceof Error) {
                await this.engine.emitAsync(`parse::error::babel-config::extends`, {
                    error: finalConfig,
                    getLocation: result.getLocation,
                    resource
                });
                return;
            }
            if (!finalConfig) {
                return;
            }
            config = finalConfig;
            const validationResult = await this.validateSchema(config, resource, result);
            if (!validationResult.valid) {
                return;
            }
            await this.engine.emitAsync('parse::end::babel-config', {
                config: validationResult.data,
                getLocation: result.getLocation,
                originalConfig,
                resource
            });
        }
        catch (err) {
            await this.engine.emitAsync('parse::error::babel-config::json', {
                error: err,
                resource
            });
        }
    }
}
exports.default = BabelConfigParser;
