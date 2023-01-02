"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.launch = void 0;
const util_1 = require("util");
const fs_1 = require("fs");
const path_1 = require("path");
const child_process_1 = require("child_process");
const locker = require("lockfile");
const puppeteer = require("puppeteer-core");
const utils_fs_1 = require("@hint/utils-fs");
const utils_debug_1 = require("@hint/utils-debug");
const debug = (0, utils_debug_1.debug)(__filename);
const deleteFile = (0, util_1.promisify)(fs_1.unlink);
const lockFile = (0, util_1.promisify)(locker.lock);
const unlockFile = (0, util_1.promisify)(locker.unlock);
const lockName = 'puppeteer-connector.lock';
let isLocked = false;
const infoFile = 'browser.info';
const TIMEOUT = 30000;
const lock = async () => {
    try {
        const start = Date.now();
        debug(`Trying to acquire lock`);
        await lockFile(lockName, {
            pollPeriod: 500,
            retries: 30,
            retryWait: 1000,
            stale: 60000,
            wait: 50000
        });
        isLocked = true;
        debug(`Lock acquired after ${(Date.now() - start) / 1000}`);
    }
    catch (e) {
        debug(`Error while locking`);
        debug(e);
        throw e;
    }
};
const unlock = async () => {
    if (isLocked) {
        const start = Date.now();
        debug(`Trying to unlock`);
        await unlockFile(lockName);
        debug(`Unlock successful after ${(Date.now() - start) / 1000}`);
    }
    else {
        debug(`No need to unlock`);
    }
};
const getBrowserInfo = async () => {
    let result = { browserWSEndpoint: '' };
    try {
        result = JSON.parse((await (0, utils_fs_1.readFileAsync)(infoFile)).trim());
    }
    catch (e) {
        debug(`Error reading ${infoFile}`);
        debug(e);
        return null;
    }
    return result;
};
const writeBrowserInfo = async (browser) => {
    const browserWSEndpoint = browser.wsEndpoint();
    const browserInfo = { browserWSEndpoint };
    await (0, utils_fs_1.writeFileAsync)(infoFile, JSON.stringify(browserInfo, null, 4));
};
const deleteBrowserInfo = async () => {
    try {
        await deleteFile(infoFile);
    }
    catch (e) {
        debug(`Error trying to delete ${infoFile}`);
        debug(e);
    }
};
const connectToBrowser = async (currentInfo, options) => {
    const connectOptions = Object.assign(Object.assign({}, currentInfo), options);
    const browser = await puppeteer.connect(connectOptions);
    debug(`Creating new page in existing browser`);
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    page.setCacheEnabled(false);
    page.setDefaultTimeout(options.timeout || TIMEOUT);
    return { browser, page };
};
const startDetached = (options) => {
    return new Promise((resolve) => {
        const launcherProcess = (0, child_process_1.spawn)(process.execPath, [(0, path_1.join)(__dirname, 'launcher.js')], {
            detached: true,
            stdio: [0, 1, 2, 'ipc']
        });
        launcherProcess.on('message', async (browserInfo) => {
            const finalOptions = Object.assign(Object.assign({}, browserInfo), options);
            const browser = await puppeteer.connect(finalOptions);
            launcherProcess.unref();
            launcherProcess.disconnect();
            resolve(browser);
        });
        launcherProcess.send(options);
    });
};
const startBrowser = async (options) => {
    debug(`Launching new browser instance`);
    let browser;
    if (options.detached) {
        debug(`Starting browser in detached mode with options:
${JSON.stringify(options, null, 2)}
`);
        try {
            browser = await startDetached(options);
        }
        catch (e) {
            debug(e);
            throw e;
        }
    }
    else {
        debug(`Starting browser in regular mode with options:
${JSON.stringify(options, null, 2)}
`);
        browser = await puppeteer.launch(options);
    }
    debug(`Creating new page`);
    const pages = await browser.pages();
    const page = pages.length > 0 ?
        await pages[0] :
        await browser.newPage();
    page.setDefaultTimeout(options.timeout || TIMEOUT);
    return { browser, page };
};
const launch = async (options) => {
    if (options.detached) {
        await lock();
        const currentInfo = await getBrowserInfo();
        if (currentInfo) {
            try {
                const connection = await connectToBrowser(currentInfo, options);
                await unlock();
                return connection;
            }
            catch (e) {
                await deleteBrowserInfo();
            }
        }
    }
    const connection = await startBrowser(options);
    const { browser } = connection;
    if (options.detached) {
        try {
            await writeBrowserInfo(browser);
            debug('Browser launched correctly');
        }
        catch (e) {
            debug('Error launching browser');
            debug(e);
            throw e;
        }
        finally {
            await unlock();
        }
    }
    return connection;
};
exports.launch = launch;
const close = async (browser, page, options) => {
    debug(`Closing`);
    if (!browser) {
        debug(`No browsing instance to close`);
        return;
    }
    if (options && options.detached) {
        await lock();
    }
    try {
        const pages = await browser.pages();
        debug(`Closing page`);
        debug(`Remaining pages: ${pages.length - 1}`);
        if (pages.length === 1) {
            if (options && options.detached) {
                await deleteBrowserInfo();
            }
            await browser.close();
        }
        else {
            await page.close();
        }
    }
    catch (e) {
        debug(`Error closing page`);
        debug(e);
    }
    finally {
        if (options && options.detached) {
            await unlock();
        }
    }
};
exports.close = close;
