"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.group = void 0;
const path_1 = require("path");
const group = (actions = []) => {
    const beforeTargetNavigation = [];
    const afterTargetNavigation = [];
    for (const actionConfig of actions) {
        let loadedAction;
        const pathToUserAction = (0, path_1.resolve)(process.cwd(), actionConfig.file);
        try {
            loadedAction = require(pathToUserAction);
        }
        catch (e) {
            throw new Error(`Couldn't load user action in "${pathToUserAction}". ${e.message}`);
        }
        if (typeof loadedAction.action !== 'function') {
            throw new Error(`User action "${pathToUserAction}" doesn't export a member "action".`);
        }
        const action = loadedAction.action;
        switch (actionConfig.on) {
            case 'afterTargetNavigation':
                afterTargetNavigation.push(action);
                break;
            case 'beforeTargetNavigation':
                beforeTargetNavigation.push(action);
                break;
            default: break;
        }
    }
    return {
        afterTargetNavigation,
        beforeTargetNavigation
    };
};
exports.group = group;
