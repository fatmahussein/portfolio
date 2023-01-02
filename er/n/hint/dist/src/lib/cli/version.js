"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@hint/utils");
exports.default = () => {
    const pkg = (0, utils_1.loadHintPackage)();
    utils_1.logger.log(`v${pkg.version}`);
    return Promise.resolve(true);
};
