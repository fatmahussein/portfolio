"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnofficialPackages = exports.getOfficialPackages = exports.search = exports.installPackages = void 0;
const child_process_1 = require("child_process");
const path = require("path");
const fs = require("fs");
const npmRegistryFetch = require("npm-registry-fetch");
const utils_debug_1 = require("@hint/utils-debug");
const utils_fs_1 = require("@hint/utils-fs");
const logger = require("./logging");
const packages_1 = require("./packages");
const has_yarnlock_1 = require("./has-yarnlock");
const debug = (0, utils_debug_1.debug)(__filename);
const install = (command) => {
    return new Promise((resolve, reject) => {
        const npmInstall = (0, child_process_1.spawn)(command, [], { shell: true, stdio: 'inherit' });
        npmInstall.on('error', (err) => {
            return reject(err);
        });
        npmInstall.on('exit', (code) => {
            if (code !== 0) {
                return reject(new Error('NoExitCodeZero'));
            }
            return resolve(true);
        });
    });
};
const installPackages = async (packages) => {
    let isDev = false;
    const currentWorkingDir = (0, utils_fs_1.cwd)();
    const isWindows = process.platform === 'win32';
    if (packages.length === 0) {
        return Promise.resolve(true);
    }
    const hintLocalPath = path.join(currentWorkingDir, 'node_modules', 'hint', 'package.json');
    const global = !fs.existsSync(hintLocalPath);
    const packageManagerChoice = (!global && await (0, has_yarnlock_1.hasYarnLock)(currentWorkingDir)) ? 'yarn' : 'npm';
    if (!global) {
        try {
            const packagePath = (0, packages_1.findPackageRoot)(currentWorkingDir);
            const jsonContent = (0, utils_fs_1.loadJSONFile)(path.join(packagePath, 'package.json'));
            isDev = jsonContent.devDependencies && jsonContent.devDependencies.hasOwnProperty('hint');
        }
        catch (err) {
            isDev = false;
        }
    }
    const installCommand = {
        npm: `npm install${global ? ' --global' : ''}${isDev ? ' --save-dev' : ''}`,
        yarn: `yarn add${isDev ? ' --dev' : ''}`
    };
    const command = `${installCommand[packageManagerChoice]} ${packages.join(' ')}`;
    try {
        debug(`Running command ${command}`);
        logger.log('Installing packages...');
        await install(command);
        return true;
    }
    catch (err) {
        debug(err);
        logger.error(`
There was a problem installing packages.
Please try executing:
    ${!isWindows && global ? 'sudo ' : ''}${command}
            manually to install all the packages.`);
        return false;
    }
};
exports.installPackages = installPackages;
const filterPackages = (packages, initTerm) => {
    return packages.filter((pkg) => {
        return pkg.name.startsWith(initTerm);
    });
};
const getPackages = (result) => {
    return result.objects.map((obj) => {
        return obj.package;
    });
};
const generateSearchQuery = (searchTerm, from, size = 100) => {
    return `/-/v1/search?text=${searchTerm}&size=${size}${from ? `&from=${from}` : ''}`;
};
const search = async (searchTerm) => {
    const result = (await npmRegistryFetch.json(generateSearchQuery(searchTerm)));
    let total = getPackages(result);
    while (result.total > total.length) {
        const r = (await npmRegistryFetch.json(generateSearchQuery(searchTerm, total.length)));
        total = total.concat(getPackages(r));
    }
    return total;
};
exports.search = search;
const getOfficialPackages = async (type) => {
    const hints = await (0, exports.search)(`@hint/${type}`);
    return filterPackages(hints, `@hint/${type}`);
};
exports.getOfficialPackages = getOfficialPackages;
const getUnofficialPackages = async (type) => {
    const hints = await (0, exports.search)(`webhint-${type}`);
    return filterPackages(hints, `webhint-${type}`);
};
exports.getUnofficialPackages = getUnofficialPackages;
