"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analyzer = void 0;
const path = require("path");
const url_1 = require("url");
const config_1 = require("./config");
const types_1 = require("./types");
const engine_1 = require("./engine");
const error_status_1 = require("./enums/error-status");
const resource_loader_1 = require("./utils/resource-loader");
const utils_1 = require("@hint/utils");
const utils_string_1 = require("@hint/utils-string");
const utils_fs_1 = require("@hint/utils-fs");
const initFormatters = (formatters) => {
    const result = formatters.map((FormatterConstructor) => {
        return new FormatterConstructor();
    });
    return result;
};
const validateResources = (resources) => {
    if (resources.missing.length > 0 || resources.incompatible.length > 0) {
        throw new types_1.AnalyzerError('Missing or incompatible dependencies', error_status_1.AnalyzerErrorStatus.ResourceError, resources);
    }
};
const validateHints = (configuration) => {
    const hintsValidation = config_1.Configuration.validateHintsConfig(configuration);
    if (hintsValidation.invalid.length > 0) {
        throw new types_1.AnalyzerError('Invalid Hints', error_status_1.AnalyzerErrorStatus.HintError, hintsValidation.invalid);
    }
};
const validateConnector = (configuration) => {
    const connectorCofigurationValid = config_1.Configuration.validateConnectorConfig(configuration);
    if (!connectorCofigurationValid) {
        throw new types_1.AnalyzerError('Invalid connector configuration', error_status_1.AnalyzerErrorStatus.ConnectorError);
    }
};
class Analyzer {
    constructor(configuration, resources, formatters) {
        this.messages = {
            'fetch::end': '%url% downloaded',
            'fetch::start': 'Downloading %url%',
            'scan::end': 'Finishing...',
            'scan::start': 'Analyzing %url%',
            'traverse::down': 'Traversing the DOM',
            'traverse::end': 'Traversing finished',
            'traverse::start': 'Traversing the DOM',
            'traverse::up': 'Traversing the DOM'
        };
        this.configuration = configuration;
        this._resources = resources;
        this.formatters = formatters;
        this.watch = this.configuration.connector && this.configuration.connector.options && this.configuration.connector.options.watch;
    }
    static create(userConfiguration, options = {}) {
        let configuration;
        if (!userConfiguration) {
            throw new types_1.AnalyzerError('Missed configuration', error_status_1.AnalyzerErrorStatus.ConfigurationError);
        }
        try {
            configuration = config_1.Configuration.fromConfig(userConfiguration, options);
        }
        catch (e) {
            throw new types_1.AnalyzerError(`Invalid configuration. ${e.message}.`, error_status_1.AnalyzerErrorStatus.ConfigurationError);
        }
        const resources = (0, resource_loader_1.loadResources)(configuration);
        const formatters = initFormatters(resources.formatters);
        validateResources(resources);
        validateConnector(configuration);
        validateHints(configuration);
        return new Analyzer(configuration, resources, formatters);
    }
    static getUserConfig(filePath) {
        const isDirectory = !(0, utils_fs_1.isFile)(filePath);
        const configPath = isDirectory ? config_1.Configuration.getFilenameForDirectory(filePath || (0, utils_fs_1.cwd)()) : filePath;
        if (!configPath) {
            return null;
        }
        try {
            const resolvedPath = path.resolve(isDirectory ? (filePath || (0, utils_fs_1.cwd)()) : (0, utils_fs_1.cwd)(), configPath);
            return config_1.Configuration.loadConfigFile(resolvedPath);
        }
        catch (_a) {
            return null;
        }
    }
    normalizeTarget(inputUrl) {
        if (inputUrl.url) {
            const target = inputUrl;
            const url = target.url instanceof url_1.URL ? target.url : new url_1.URL(target.url);
            return {
                content: target.content,
                url
            };
        }
        const url = inputUrl instanceof url_1.URL ? inputUrl : new url_1.URL(inputUrl);
        return {
            content: undefined,
            url
        };
    }
    normalizeEvent(event) {
        if (event.startsWith('fetch::end')) {
            return 'fetch::end';
        }
        return event;
    }
    configureEngine(engine, url, options) {
        if (options.updateCallback) {
            engine.prependAny(((event, value) => {
                const message = this.messages[this.normalizeEvent(event)];
                if (!message) {
                    return;
                }
                options.updateCallback({
                    message: message.replace('%url%', (0, utils_string_1.cutString)(value.resource)),
                    resource: value.resource,
                    url
                });
            }));
        }
        if (this.watch) {
            engine.on('print', async (event) => {
                await this.format(event.problems);
            });
        }
    }
    async analyze(endpoints, options = {}) {
        let targets;
        const results = [];
        if (Array.isArray(endpoints)) {
            targets = endpoints.map(this.normalizeTarget);
        }
        else {
            targets = [this.normalizeTarget(endpoints)];
        }
        for (const target of targets) {
            const url = target.url;
            if (target.content && this.configuration.connector.name !== 'local') {
                throw new types_1.AnalyzerError(`Property 'content' is only supported in formatter local. Webhint will analyze the url ${url.href}`, error_status_1.AnalyzerErrorStatus.AnalyzeError);
            }
            this.engine = new engine_1.Engine(this.configuration, this._resources);
            this.configureEngine(this.engine, url.href, options);
            let problems = null;
            try {
                if (options.targetStartCallback) {
                    await options.targetStartCallback({ url: url.href });
                }
                problems = await this.engine.executeOn(url, { content: target.content });
            }
            catch (e) {
                throw new types_1.AnalyzerError(e, error_status_1.AnalyzerErrorStatus.AnalyzeError);
            }
            finally {
                await this.engine.close();
            }
            if (options.targetEndCallback) {
                await options.targetEndCallback({
                    problems: problems,
                    url: url.href
                });
            }
            results.push({
                problems: problems,
                url: target.url.href
            });
        }
        if (this.watch && this.configuration.connector.name !== 'local') {
            utils_1.logger.warn(`WARNING: The option 'watch' is not supported in connector '${this.configuration.connector.name}'`);
        }
        return results;
    }
    async format(problems, options = {}) {
        options.language = options.language || this.configuration.language;
        options.resources = options.resources || this.resources;
        for (const formatter of this.formatters) {
            await formatter.format(problems, options);
        }
    }
    close() {
        if (this.engine) {
            return this.engine.close();
        }
        return Promise.resolve();
    }
    get resources() {
        return this._resources;
    }
}
exports.Analyzer = Analyzer;
