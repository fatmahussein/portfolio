"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHintsFromConfiguration = void 0;
const normalize_hints_1 = require("./normalize-hints");
const load_resource_1 = require("../packages/load-resource");
const enums_1 = require("../packages/enums");
const getHintsFromExtend = (extendName, parentConfigs = []) => {
    try {
        if (parentConfigs.includes(extendName)) {
            return {};
        }
        const configuration = (0, load_resource_1.loadResource)(extendName, enums_1.ResourceType.configuration, parentConfigs);
        return Object.assign(Object.assign({}, getHintsFromExtends(configuration.extends, [extendName, ...parentConfigs])), (0, normalize_hints_1.default)(configuration.hints || {}));
    }
    catch (e) {
        return {};
    }
};
const getHintsFromExtends = (extendNames, parentConfigs = []) => {
    if (!extendNames || extendNames.length === 0) {
        return {};
    }
    const extendName = extendNames[0];
    return Object.assign(Object.assign({}, getHintsFromExtend(extendName, parentConfigs)), getHintsFromExtends(extendNames.slice(1), parentConfigs));
};
const getHintsFromConfiguration = (userConfig) => {
    return Object.assign(Object.assign({}, getHintsFromExtends(userConfig.extends)), (0, normalize_hints_1.default)(userConfig.hints || {}));
};
exports.getHintsFromConfiguration = getHintsFromConfiguration;
