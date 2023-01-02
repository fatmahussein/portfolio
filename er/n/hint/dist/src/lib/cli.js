"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const chalk = require("chalk");
const updateNotifier = require("update-notifier");
const utils_1 = require("@hint/utils");
const options_1 = require("./cli/options");
const actions_1 = require("./cli/actions");
const notifyIfNeeded = () => {
    const pkg = (0, utils_1.loadHintPackage)();
    const notifier = updateNotifier({
        pkg,
        updateCheckInterval: 1000 * 60 * 60 * 1
    });
    const update = notifier.update;
    if (!update || update.latest === pkg.version) {
        return;
    }
    const changelogUrl = `https://webhint.io/about/changelog/`;
    const message = `Update available ${chalk.red(update.current)}${chalk.reset(' → ')}${chalk.green(update.latest)}\
\nSee ${chalk.cyan(changelogUrl)} for details`;
    notifier.notify({ message });
};
const execute = async (args) => {
    let currentOptions;
    try {
        currentOptions = options_1.options.parse(args);
    }
    catch (e) {
        utils_1.logger.error(e.message);
        return 1;
    }
    let handled = false;
    notifyIfNeeded();
    while (actions_1.cliActions.length > 0 && !handled) {
        const action = actions_1.cliActions.shift();
        try {
            handled = await action(currentOptions);
        }
        catch (e) {
            utils_1.logger.error(e);
            return 1;
        }
    }
    return handled ? 0 : 1;
};
exports.execute = execute;
