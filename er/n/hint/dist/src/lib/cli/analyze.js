"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const isCI = require("is-ci");
const ora = require("ora");
const osLocale = require("os-locale");
const utils_1 = require("@hint/utils");
const utils_fs_1 = require("@hint/utils-fs");
const utils_network_1 = require("@hint/utils-network");
const utils_debug_1 = require("@hint/utils-debug");
const utils_types_1 = require("@hint/utils-types");
const __1 = require("../");
const error_status_1 = require("../enums/error-status");
const debug = (0, utils_debug_1.debug)(__filename);
const spinner = ora({ spinner: 'line' });
const showDefaultMessage = () => {
    const defaultMessage = `Using the built-in configuration.
Visit https://webhint.io/docs/user-guide/ to learn how to create your own configuration.`;
    utils_1.logger.log(defaultMessage);
};
const areFiles = (targets) => {
    return targets.every((target) => {
        return target.protocol === 'file:';
    });
};
const anyFile = (targets) => {
    return targets.some((target) => {
        return target.protocol === 'file:';
    });
};
const getDefaultConfiguration = (targets) => {
    showDefaultMessage();
    const targetsAreFiles = areFiles(targets);
    if (!targetsAreFiles && anyFile(targets)) {
        throw new Error('You cannot mix file system with urls in the analysis');
    }
    const ext = targetsAreFiles ? 'development' : 'web-recommended';
    const config = { extends: [ext] };
    if (isCI) {
        config.formatters = ['html', 'stylish'];
    }
    return config;
};
const askUserToUseDefaultConfiguration = async (targets) => {
    const question = `A valid configuration file can't be found. Do you want to use the default configuration? To know more about the default configuration see: https://webhint.io/docs/user-guide/#default-configuration`;
    const confirmation = await (0, utils_1.askQuestion)(question);
    if (confirmation) {
        return getDefaultConfiguration(targets);
    }
    return null;
};
const showMissingAndIncompatiblePackages = (resources) => {
    if (resources.missing.length > 0) {
        utils_1.logger.log(`The following ${resources.missing.length === 1 ? 'package is' : 'packages are'} missing:
    ${resources.missing.join(', ')}`);
    }
    if (resources.incompatible.length > 0) {
        utils_1.logger.log(`The following ${resources.incompatible.length === 1 ? 'package is' : 'packages are'} incompatible:
    ${resources.incompatible.join(', ')}`);
    }
};
const askUserToInstallDependencies = async (resources) => {
    showMissingAndIncompatiblePackages(resources);
    const dependencies = resources.incompatible.concat(resources.missing);
    const question = `There ${dependencies.length === 1 ? 'is a package' : 'are packages'} from your .hintrc file not installed or with an incompatible version. Do you want us to try to install/update them?`;
    const answer = await (0, utils_1.askQuestion)(question);
    return answer;
};
const getLanguage = async (userConfig, actions) => {
    if (actions && actions.language) {
        debug(`Using language option provided from command line: ${actions.language}`);
        return actions.language;
    }
    if (userConfig && userConfig.language) {
        debug(`Using language option provided in user config file: ${userConfig.language}`);
        return userConfig.language;
    }
    const osLanguage = await osLocale();
    debug(`Using language option configured in the OS: ${osLanguage}`);
    return osLanguage;
};
const loadUserConfig = async (actions, targets) => {
    let userConfig = (0, __1.getUserConfig)(actions.config);
    if (!userConfig) {
        userConfig = getDefaultConfiguration(targets);
    }
    userConfig.language = await getLanguage(userConfig, actions);
    userConfig = (0, utils_1.mergeEnvWithOptions)(userConfig);
    return userConfig;
};
const askToInstallPackages = async (resources) => {
    const missingPackages = resources.missing.map((name) => {
        return `@hint/${name}`;
    });
    const incompatiblePackages = resources.incompatible.map((name) => {
        return `@hint/${name}@latest`;
    });
    if (!(await askUserToInstallDependencies(resources) &&
        await (0, utils_1.installPackages)(missingPackages) &&
        await (0, utils_1.installPackages)(incompatiblePackages))) {
        return false;
    }
    return true;
};
const getAnalyzer = async (userConfig, options, targets) => {
    let webhint;
    try {
        webhint = (0, __1.createAnalyzer)(userConfig, options);
    }
    catch (e) {
        const error = e;
        if (error.status === error_status_1.AnalyzerErrorStatus.ConfigurationError) {
            const config = await askUserToUseDefaultConfiguration(targets);
            if (!config) {
                throw e;
            }
            return getAnalyzer(config, options, targets);
        }
        if (error.status === error_status_1.AnalyzerErrorStatus.ResourceError) {
            const installed = await askToInstallPackages(error.resources);
            if (!installed) {
                throw e;
            }
            return getAnalyzer(userConfig, options, targets);
        }
        if (error.status === error_status_1.AnalyzerErrorStatus.HintError) {
            utils_1.logger.error(`Invalid hint configuration in .hintrc: ${error.invalidHints.join(', ')}.`);
            throw e;
        }
        if (error.status === error_status_1.AnalyzerErrorStatus.ConnectorError) {
            utils_1.logger.error(`Invalid connector configuration in .hintrc`);
            throw e;
        }
        utils_1.logger.error(e.message, e);
        throw e;
    }
    return webhint;
};
const actionsToOptions = (actions) => {
    const options = {
        formatters: actions.formatters ? actions.formatters.split(',') : undefined,
        hints: actions.hints ? actions.hints.split(',') : undefined,
        watch: actions.watch
    };
    return options;
};
exports.default = async (actions) => {
    const targets = (0, utils_network_1.getAsUris)(actions._);
    const useSpinner = !actions.debug && !isCI;
    if (targets.length === 0) {
        return false;
    }
    const userConfig = await loadUserConfig(actions, targets);
    const createAnalyzerOptions = actionsToOptions(actions);
    let webhint;
    try {
        webhint = await getAnalyzer(userConfig, createAnalyzerOptions, targets);
    }
    catch (e) {
        return false;
    }
    const start = Date.now();
    let exitCode = 0;
    const endSpinner = (method) => {
        if (useSpinner && spinner[method]) {
            spinner[method]();
        }
    };
    const hasIssues = (reports) => {
        const threshold = userConfig.severityThreshold || utils_types_1.Severity.error;
        for (const result of reports) {
            if (result.severity >= threshold) {
                return true;
            }
        }
        return false;
    };
    const print = async (reports, target, scanTime, date) => {
        await webhint.format(reports, {
            config: userConfig || undefined,
            date,
            output: actions.output ? path.resolve((0, utils_fs_1.cwd)(), actions.output) : undefined,
            resources: webhint.resources,
            scanTime,
            target,
            version: (0, utils_1.loadHintPackage)().version
        });
    };
    const getAnalyzeOptions = () => {
        const scanStart = new Map();
        const analyzerOptions = {
            targetEndCallback: undefined,
            targetStartCallback: undefined,
            updateCallback: undefined
        };
        if (useSpinner) {
            analyzerOptions.updateCallback = (update) => {
                spinner.text = update.message;
            };
        }
        analyzerOptions.targetStartCallback = (start) => {
            if (useSpinner) {
                spinner.start();
            }
            scanStart.set(start.url, Date.now());
        };
        analyzerOptions.targetEndCallback = async (end) => {
            const scanEnd = Date.now();
            const start = scanStart.get(end.url) || 0;
            if (hasIssues(end.problems)) {
                exitCode = 1;
            }
            endSpinner(exitCode ? 'fail' : 'succeed');
            await print(end.problems, end.url, scanEnd - start, new Date(start).toISOString());
        };
        return analyzerOptions;
    };
    try {
        await webhint.analyze(targets, getAnalyzeOptions());
    }
    catch (e) {
        exitCode = 1;
        endSpinner('fail');
        debug(`Failed to analyze: ${targets}`);
        debug(e);
        utils_1.logger.error(e);
    }
    debug(`Total runtime: ${Date.now() - start}ms`);
    return exitCode === 0;
};
