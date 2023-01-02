"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadResources = exports.loadConfiguration = exports.loadHint = exports.getInstalledResources = exports.getCoreResources = void 0;
const path = require("path");
const globby = require("globby");
const utils_1 = require("@hint/utils");
const utils_fs_1 = require("@hint/utils-fs");
const utils_debug_1 = require("@hint/utils-debug");
const debug = (0, utils_debug_1.debug)(__filename);
const HINT_ROOT = (0, utils_1.findPackageRoot)();
const NODE_MODULES_ROOT = (() => {
    const root = (0, utils_1.findNodeModulesRoot)();
    return root;
})();
const resourceIds = new Map();
const getCoreResources = (type) => {
    if (resourceIds.has(type)) {
        return resourceIds.get(type);
    }
    const resourcesFiles = globby.sync(`dist/src/lib/${type}s/**/*.js`, { cwd: HINT_ROOT });
    const ids = resourcesFiles.reduce((list, resourceFile) => {
        const resourceName = path.basename(resourceFile, '.js');
        if (path.dirname(resourceFile).includes(resourceName)) {
            list.push(resourceName);
        }
        return list;
    }, []);
    resourceIds.set(type, ids);
    return ids;
};
exports.getCoreResources = getCoreResources;
const getInstalledResources = (type) => {
    const installedType = `installed-${type}`;
    if (resourceIds.has(installedType)) {
        return resourceIds.get(installedType);
    }
    const resourcesFiles = globby.sync(`${NODE_MODULES_ROOT.replace(/\\/g, '/')}/@hint/${type}-*/package.json`);
    const ids = resourcesFiles.reduce((list, resourceFile) => {
        const resource = (0, utils_1.requirePackage)(path.dirname(resourceFile));
        const packageName = JSON.parse((0, utils_fs_1.readFile)(resourceFile)).name;
        const resourceName = packageName.substr(packageName.lastIndexOf('/') + 1).replace(`${type}-`, '');
        if (!(0, utils_1.hasMultipleResources)(resource, type)) {
            list.push(resourceName);
        }
        else {
            const hints = Object.entries(resource);
            if (hints.length === 1 && resource[resourceName]) {
                list.push(resourceName);
            }
            else {
                for (const [key] of hints) {
                    list.push(`${resourceName}/${key}`);
                }
            }
        }
        return list;
    }, []);
    resourceIds.set(installedType, ids);
    return ids;
};
exports.getInstalledResources = getInstalledResources;
const loadListOfResources = (list = [], type, configurations = []) => {
    const missing = [];
    const incompatible = [];
    const items = Array.isArray(list) ?
        list :
        Object.keys(list);
    const loadedResources = items.reduce((loaded, resourceId) => {
        try {
            const resource = (0, utils_1.loadResource)(resourceId, type, configurations, true);
            loaded.push(resource);
        }
        catch (e) {
            const name = (0, utils_1.isFullPackageName)(resourceId, type) ? resourceId : `${type}-${resourceId}`;
            const error = e;
            if (error.status === utils_1.ResourceErrorStatus.NotCompatible) {
                incompatible.push(name);
            }
            else if (error.status === utils_1.ResourceErrorStatus.NotFound) {
                missing.push(name);
            }
            else {
                throw error;
            }
        }
        return loaded;
    }, []);
    return {
        incompatible,
        missing,
        resources: loadedResources
    };
};
const loadHint = (hintId, configurations) => {
    return (0, utils_1.loadResource)(hintId, utils_1.ResourceType.hint, configurations);
};
exports.loadHint = loadHint;
const loadConfiguration = (configurationId, configurations) => {
    return (0, utils_1.loadResource)(configurationId, utils_1.ResourceType.configuration, configurations);
};
exports.loadConfiguration = loadConfiguration;
const loadResources = (config) => {
    let connector = null;
    const connectorName = config.connector && config.connector.name || '';
    try {
        connector = (0, utils_1.loadResource)(connectorName, utils_1.ResourceType.connector, config.extends, true);
    }
    catch (e) {
        debug(e);
        if (e.status === utils_1.ResourceErrorStatus.DependencyError) {
            throw e;
        }
    }
    const { incompatible: incompatibleHints, resources: hints, missing: missingHints } = loadListOfResources(config.hints, utils_1.ResourceType.hint, config.extends);
    const { incompatible: incompatibleParsers, resources: parsers, missing: missingParsers } = loadListOfResources(config.parsers, utils_1.ResourceType.parser, config.extends);
    const { incompatible: incompatibleFormatters, resources: formatters, missing: missingFormatters } = loadListOfResources(config.formatters, utils_1.ResourceType.formatter, config.extends);
    const missing = [].concat(missingHints, missingParsers, missingFormatters);
    const incompatible = [].concat(incompatibleFormatters, incompatibleParsers, incompatibleHints);
    if (!connector) {
        missing.push(`${utils_1.ResourceType.connector}-${connectorName || config.connector}`);
    }
    return {
        connector,
        formatters,
        hints,
        incompatible,
        missing,
        parsers
    };
};
exports.loadResources = loadResources;
