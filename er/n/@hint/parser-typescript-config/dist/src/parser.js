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
const lodash_1 = require("lodash");
const utils_fs_1 = require("@hint/utils-fs");
const utils_json_1 = require("@hint/utils-json");
const hint_1 = require("hint");
__exportStar(require("./types"), exports);
class TypeScriptConfigParser extends hint_1.Parser {
    constructor(engine) {
        super(engine, 'typescript-config');
        this.schemaPath = path.join(__dirname, 'schema.json');
        this.schema = (0, utils_fs_1.loadJSONFile)(this.schemaPath);
        engine.on('fetch::end::*', this.parseTypeScript.bind(this));
    }
    async validateSchema(config, resource, result) {
        const validationResult = (0, utils_json_1.validate)(this.schema, config, result.getLocation);
        const valid = validationResult.valid;
        if (!valid) {
            await this.engine.emitAsync(`parse::error::typescript-config::schema`, {
                error: new Error('Invalid TypeScript configuration'),
                errors: validationResult.errors,
                groupedErrors: validationResult.groupedErrors,
                prettifiedErrors: validationResult.prettifiedErrors,
                resource
            });
        }
        return validationResult;
    }
    async parseTypeScript(fetchEnd) {
        const resource = fetchEnd.resource;
        const fileName = path.basename(resource);
        if (!fileName.match(/^tsconfig\.([^.]*\.)?json$/gi) || fileName === 'tsconfig.schema.json') {
            return;
        }
        await this.engine.emitAsync(`parse::start::typescript-config`, { resource });
        let result;
        try {
            result = (0, utils_json_1.parseJSON)(fetchEnd.response.body.content);
            const originalConfig = (0, lodash_1.cloneDeep)(result.data);
            const config = (0, utils_json_1.finalConfig)(result.data, resource);
            if (config instanceof Error) {
                await this.engine.emitAsync(`parse::error::typescript-config::extends`, {
                    error: config,
                    getLocation: result.getLocation,
                    resource: config.resource
                });
                return;
            }
            if (!config) {
                return;
            }
            const validationResult = await this.validateSchema(config, resource, result);
            if (!validationResult.valid) {
                return;
            }
            await this.engine.emitAsync(`parse::end::typescript-config`, {
                config: validationResult.data,
                getLocation: result.getLocation,
                mergedConfig: config,
                originalConfig,
                resource
            });
        }
        catch (err) {
            await this.engine.emitAsync(`parse::error::typescript-config::json`, {
                error: err,
                resource
            });
        }
    }
}
exports.default = TypeScriptConfigParser;
