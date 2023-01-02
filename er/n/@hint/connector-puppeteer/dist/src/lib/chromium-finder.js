"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstallationPath = exports.Browser = void 0;
const path = require("path");
const utils_fs_1 = require("@hint/utils-fs");
const utils_1 = require("@hint/utils");
const child_process_1 = require("child_process");
const newLineRegex = /\r?\n/;
var Browser;
(function (Browser) {
    Browser["Chrome"] = "Chrome";
    Browser["Chromium"] = "Chromium";
    Browser["Edge"] = "Edge";
})(Browser = exports.Browser || (exports.Browser = {}));
const ERRORS = {
    InvalidPath: (strings, p) => {
        return `The provided path is not accessible: "${p}"`;
    },
    NoInstallationFound: (strings, browser) => {
        return `No installation found for: "${browser}"`;
    },
    NotSupportedBrowser: (strings, browser) => {
        return `The provided browser ("${browser}") is not supported in this platform`;
    },
    UnsupportedPlatform: (strings, platform) => {
        return `Unsupported platform: "${platform}"`;
    }
};
const browserVariables = new Map([
    ['darwin', new Map([
            [
                Browser.Chrome, [
                    '/Contents/MacOS/Google Chrome Canary',
                    '/Contents/MacOS/Google Chrome'
                ]
            ],
            [
                Browser.Chromium, [
                    '/Contents/MacOS/Chromium'
                ]
            ],
            [
                Browser.Edge, [
                    '/Contents/MacOS/Microsoft Edge Canary',
                    '/Contents/MacOS/Microsoft Edge'
                ]
            ]
        ])],
    ['linux', new Map([
            [
                Browser.Chrome, [
                    '(google-chrome|chrome)',
                    'google-chrome-stable',
                    'google-chrome'
                ]
            ],
            [
                Browser.Chromium, [
                    '(chromium)',
                    'chromium-browser',
                    'chromium'
                ]
            ]
        ])],
    ['win32', new Map([
            [
                Browser.Chrome, [
                    `${path.sep}Google${path.sep}Chrome SxS${path.sep}Application${path.sep}chrome.exe`,
                    `${path.sep}Google${path.sep}Chrome${path.sep}Application${path.sep}chrome.exe`
                ]
            ],
            [
                Browser.Chromium, [
                    `${path.sep}Chromium${path.sep}Application${path.sep}chromium.exe`
                ]
            ],
            [
                Browser.Edge, [
                    `${path.sep}Microsoft${path.sep}Edge SxS${path.sep}Application${path.sep}msedge.exe`,
                    `${path.sep}Microsoft${path.sep}Edge${path.sep}Application${path.sep}msedge.exe`,
                    `${path.sep}Microsoft${path.sep}Edge Dev SxS${path.sep}Application${path.sep}msedge.exe`,
                    `${path.sep}Microsoft${path.sep}Edge Dev${path.sep}Application${path.sep}msedge.exe`
                ]
            ]
        ])]
]);
const darwin = (browser) => {
    const platformBrowserInfo = browserVariables.get('darwin');
    const suffixes = platformBrowserInfo.get(browser);
    if (!suffixes) {
        throw new Error(ERRORS.NotSupportedBrowser `${browser}`);
    }
    const LSREGISTER = '/System/Library/Frameworks/CoreServices.framework' +
        '/Versions/A/Frameworks/LaunchServices.framework' +
        '/Versions/A/Support/lsregister';
    const lines = (0, child_process_1.execSync)(`${LSREGISTER} -dump` +
        ` | grep -i '\.app'` +
        ` | awk '{print $2,$3}'`)
        .toString()
        .split(newLineRegex);
    for (const suffix of suffixes) {
        for (const inst of lines) {
            const execPath = path.join(inst.trim(), suffix);
            if ((0, utils_fs_1.isFile)(execPath)) {
                return execPath;
            }
        }
    }
    return '';
};
const findChromeExecutable = (folder, regExes) => {
    const argumentsRegex = /(^[^ ]+).*/;
    for (const browserRegex of regExes) {
        const chromeExecRegex = `^Exec=/.*/${browserRegex}-.*`;
        if ((0, utils_fs_1.isDirectory)(folder)) {
            let execPaths;
            try {
                execPaths = (0, child_process_1.execSync)(`grep -ER "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`);
            }
            catch (e) {
                execPaths = (0, child_process_1.execSync)(`grep -Er "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`);
            }
            execPaths = execPaths.toString()
                .split(newLineRegex)
                .map((execPath) => {
                return execPath.replace(argumentsRegex, '$1');
            });
            for (const execPath of execPaths) {
                if ((0, utils_fs_1.isFile)(execPath)) {
                    return execPath;
                }
            }
        }
    }
    return '';
};
const linux = (browser) => {
    const desktopInstallationFolders = [
        path.join(require('os').homedir(), '.local/share/applications/'),
        '/usr/share/applications/'
    ];
    const browserPartsInfo = browserVariables.get('linux');
    const executables = browserPartsInfo.get(browser);
    if (!executables) {
        throw new Error(ERRORS.NotSupportedBrowser `${browser}`);
    }
    for (const folder of desktopInstallationFolders) {
        const executable = findChromeExecutable(folder, executables);
        if (executable) {
            return executable;
        }
    }
    for (const executable of executables) {
        try {
            const chromePath = (0, child_process_1.execFileSync)('which', [executable], { stdio: 'pipe' }).toString()
                .split(newLineRegex)[0];
            if (chromePath && (0, utils_fs_1.isFile)(chromePath)) {
                return chromePath;
            }
        }
        catch (e) {
        }
    }
    return '';
};
const win32 = (browser) => {
    const info = browserVariables.get('win32');
    const suffixes = info.get(browser);
    if (!suffixes) {
        throw new Error(ERRORS.NotSupportedBrowser `${browser}`);
    }
    const prefixes = [
        (0, utils_1.getVariable)('LOCALAPPDATA'),
        (0, utils_1.getVariable)('PROGRAMFILES'),
        (0, utils_1.getVariable)('PROGRAMFILES(X86)')
    ].filter(Boolean);
    for (const suffix of suffixes) {
        for (const prefix of prefixes) {
            const browserPath = path.join(prefix, suffix);
            if ((0, utils_fs_1.isFile)(browserPath)) {
                return browserPath;
            }
        }
    }
    return '';
};
const finders = new Map([
    ['darwin', darwin],
    ['linux', linux],
    ['win32', win32],
    ['wsl', linux]
]);
const findBrowserPath = (browser) => {
    const platform = (0, utils_1.getPlatform)();
    const finder = finders.get(platform);
    if (!finder) {
        throw new Error(ERRORS.UnsupportedPlatform `${platform}`);
    }
    return finder(browser);
};
const resolveChromiumPath = () => {
    const chromiumPaths = [
        (0, utils_1.getVariable)('WEBHINT_CHROMIUM_PATH'),
        (0, utils_1.getVariable)('CHROME_PATH')
    ];
    while (chromiumPaths.length > 0) {
        const browserPath = chromiumPaths.shift();
        if ((0, utils_fs_1.isFile)(browserPath)) {
            return browserPath;
        }
    }
    return '';
};
const getInstallationPath = (options) => {
    if (options && options.browserPath) {
        if ((0, utils_fs_1.isFile)(options.browserPath)) {
            return options.browserPath;
        }
        throw new Error(ERRORS.InvalidPath `${options.browserPath}`);
    }
    const resolvedChromiumPath = resolveChromiumPath();
    if (resolvedChromiumPath) {
        return resolvedChromiumPath;
    }
    if (options && options.browser) {
        const browserPath = findBrowserPath(options.browser);
        if (browserPath) {
            return browserPath;
        }
        throw new Error(ERRORS.NoInstallationFound `${options.browser}`);
    }
    try {
        return require('puppeteer').executablePath();
    }
    catch (e) {
    }
    const browsers = [Browser.Chrome, Browser.Chromium, Browser.Edge];
    let browserFound = '';
    while (browsers.length > 0 && !browserFound) {
        const br = browsers.shift();
        try {
            browserFound = findBrowserPath(br);
        }
        catch (e) {
        }
    }
    if (!browserFound) {
        const message = 'Any supported browsers';
        throw new Error(ERRORS.NoInstallationFound `${message}`);
    }
    return browserFound;
};
exports.getInstallationPath = getInstallationPath;
