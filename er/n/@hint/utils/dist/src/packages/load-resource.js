"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadResource = exports.tryToLoadFrom = void 0;
const fs = require("fs");
const path = require("path");
const globby = require("globby");
const semver = require("semver");
const utils_fs_1 = require("@hint/utils-fs");
const utils_debug_1 = require("@hint/utils-debug");
const utils_string_1 = require("@hint/utils-string");
const is_full_package_name_1 = require("./is-full-package-name");
const load_package_1 = require("./load-package");
const load_hint_package_1 = require("./load-hint-package");
const require_package_1 = require("./require-package");
const has_multiple_resources_1 = require("./has-multiple-resources");
const to_absolute_paths_1 = require("../config/to-absolute-paths");
const enums_1 = require("./enums");
const resource_error_1 = require("./resource-error");
const debug = (0, utils_debug_1.debug)(__filename);
const resources = new Map();
const moduleNameRegex = /[^']*'([^']*)'/g;
const isVersionValid = (resourcePath) => {
    try {
        const pkg = (0, load_package_1.loadPackage)(resourcePath);
        const hintPkg = (0, load_hint_package_1.loadHintPackage)();
        return semver.satisfies(hintPkg.version, pkg.peerDependencies.hint);
    }
    catch (e) {
        debug(e);
        return true;
    }
};
const tryToLoadFrom = (resourcePath) => {
    let builder = null;
    try {
        const resource = (0, utils_fs_1.loadJSONFile)(resourcePath);
        return resource;
    }
    catch (e) {
        debug(`${resourcePath} is not a JSON file, trying to load it normally`);
    }
    try {
        const resource = (0, require_package_1.requirePackage)(resourcePath);
        builder = resource.default || resource;
    }
    catch (e) {
        debug(`Can't require ${resourcePath}`);
        if (e.code === 'MODULE_NOT_FOUND') {
            const exec = moduleNameRegex.exec(e.message);
            const moduleName = exec ? exec[1] : null;
            if (!moduleName || moduleName === resourcePath) {
                return null;
            }
            const errorMessage = `Module ${moduleName} not found when loading ${resourcePath}`;
            throw new resource_error_1.ResourceError(errorMessage, enums_1.ResourceErrorStatus.DependencyError);
        }
        throw new resource_error_1.ResourceError(e, enums_1.ResourceErrorStatus.Unknown);
    }
    return builder;
};
exports.tryToLoadFrom = tryToLoadFrom;
const getResource = (source, type, name) => {
    const resource = (0, exports.tryToLoadFrom)(source);
    if (!resource) {
        return null;
    }
    if (!(0, has_multiple_resources_1.hasMultipleResources)(resource, type)) {
        return resource;
    }
    for (const [key, value] of Object.entries(resource)) {
        if (key === name) {
            return value.default || value;
        }
    }
    return null;
};
const resolvePackage = (modulePath) => {
    let pkgPath;
    if (process.env.webpack) {
        pkgPath = __non_webpack_require__.resolve(modulePath);
    }
    else {
        pkgPath = require.resolve(modulePath);
    }
    return pkgPath;
};
const generateConfigPathsToResources = (configurations, name, type) => {
    return configurations.reduce((total, configuration) => {
        const basePackagePaths = (0, is_full_package_name_1.isFullPackageName)(configuration, enums_1.ResourceType.configuration) ?
            [''] :
            ['@hint/configuration-', 'webhint-configuration-'];
        let result = total;
        for (const basePackagePath of basePackagePaths) {
            const packageName = `${basePackagePath}${configuration}`;
            try {
                const packagePath = path.dirname(resolvePackage(packageName));
                const resourceGlob = (0, is_full_package_name_1.isFullPackageName)(name, type) ?
                    name :
                    `{@hint/,webhint-}${type}-${name}`;
                const resourcePackages = globby.sync(`node_modules/${resourceGlob}/package.json`, { absolute: true, cwd: packagePath }).map((pkg) => {
                    return path.dirname(pkg);
                });
                result = result.concat(resourcePackages);
            }
            catch (err) {
                debug(`Package ${packageName} not found`);
            }
        }
        return result;
    }, []);
};
const isFilesystemPath = (filename) => {
    return filename[0] === '.' || filename[0] === '/' || filename[1] === ':';
};
const loadResource = (name, type, configurations = [], verifyVersion = false) => {
    debug(`Searching ${name}…`);
    const isSource = isFilesystemPath(name) && fs.existsSync(name);
    const isPackage = (0, is_full_package_name_1.isFullPackageName)(name, type);
    const nameParts = name.split('/');
    let scope = '';
    let unscopedNameParts = nameParts;
    if (isPackage && nameParts[0].startsWith('@')) {
        scope = `${nameParts[0]}/`;
        unscopedNameParts = nameParts.slice(1);
    }
    const packageName = `${scope}${unscopedNameParts[0]}`;
    const resourceName = isSource ?
        name : unscopedNameParts[1] || packageName;
    const key = isPackage || isSource ?
        name :
        `${type}-${name}`;
    if (resources.has(key) && !verifyVersion) {
        return resources.get(key);
    }
    const configPathsToResources = generateConfigPathsToResources(configurations, packageName, type);
    const currentProcessDir = (0, utils_fs_1.cwd)();
    let sources;
    if (isSource) {
        sources = [path.resolve(currentProcessDir, name)];
    }
    else if (isPackage) {
        sources = [packageName].concat(configPathsToResources);
    }
    else {
        sources = [
            `@hint/${type}-${packageName}`,
            `webhint-${type}-${packageName}`,
            path.normalize(currentProcessDir)
        ].concat(configPathsToResources);
    }
    let resource;
    let loadedSource;
    let isValid = true;
    sources.some((source) => {
        const res = getResource(source, type, resourceName);
        if (res && isSource) {
            isValid = true;
            resource = res;
            loadedSource = source;
            return true;
        }
        if (res && !isSource) {
            debug(`${name} found in ${source}`);
            if (source === currentProcessDir) {
                try {
                    const packageConfig = (0, load_package_1.loadPackage)(source);
                    if (!(0, utils_string_1.normalizeIncludes)(packageConfig.name, packageName)) {
                        return false;
                    }
                }
                catch (e) {
                    return false;
                }
            }
            if (verifyVersion && !isVersionValid(source)) {
                debug(`Resource ${name} isn't compatible with current hint version`);
                isValid = false;
                return false;
            }
            isValid = true;
            resource = res;
            loadedSource = source;
        }
        return resource;
    });
    if (!isValid) {
        throw new resource_error_1.ResourceError(`Resource ${name} isn't compatible with current hint version`, enums_1.ResourceErrorStatus.NotCompatible);
    }
    if (!resource) {
        debug(`Resource ${name} not found`);
        throw new resource_error_1.ResourceError(`Resource ${name} not found`, enums_1.ResourceErrorStatus.NotFound);
    }
    if (type === enums_1.ResourceType.configuration) {
        resource = (0, to_absolute_paths_1.toAbsolutePaths)(resource, resolvePackage(loadedSource));
    }
    resources.set(key, resource);
    return resource;
};
exports.loadResource = loadResource;
