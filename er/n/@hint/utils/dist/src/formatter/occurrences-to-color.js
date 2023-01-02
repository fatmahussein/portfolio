"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.occurencesToColor = void 0;
const severity_to_color_1 = require("./severity-to-color");
const utils_types_1 = require("@hint/utils-types");
const occurencesToColor = (ocurrences) => {
    if (ocurrences[utils_types_1.Severity.error] > 0) {
        return (0, severity_to_color_1.severityToColor)(utils_types_1.Severity.error);
    }
    else if (ocurrences[utils_types_1.Severity.warning] > 0) {
        return (0, severity_to_color_1.severityToColor)(utils_types_1.Severity.warning);
    }
    else if (ocurrences[utils_types_1.Severity.hint] > 0) {
        return (0, severity_to_color_1.severityToColor)(utils_types_1.Severity.hint);
    }
    else if (ocurrences[utils_types_1.Severity.information] > 0) {
        return (0, severity_to_color_1.severityToColor)(utils_types_1.Severity.information);
    }
    return (0, severity_to_color_1.severityToColor)(utils_types_1.Severity.warning);
};
exports.occurencesToColor = occurencesToColor;
