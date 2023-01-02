"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = void 0;
const optionator = require("optionator");
exports.options = optionator({
    defaults: {
        concatRepeatedArrays: true,
        mergeRepeatedObjects: true
    },
    options: [
        { heading: 'Basic configuration' },
        {
            alias: 'c',
            description: 'Use configuration from this file or shareable config',
            option: 'config',
            type: 'path::String'
        },
        { heading: 'Miscellaneous' },
        {
            default: false,
            description: 'Output debugging information',
            option: 'debug',
            type: 'Boolean'
        },
        {
            default: false,
            description: 'Output debugging information related with analytics',
            option: 'analytics-debug',
            type: 'Boolean'
        },
        {
            alias: 'h',
            description: 'Show help',
            option: 'help',
            type: 'Boolean'
        },
        {
            alias: 'v',
            description: 'Output the version number',
            option: 'version',
            type: 'Boolean'
        },
        {
            alias: 'w',
            description: 'Activate a watcher for the connector (if supported)',
            option: 'watch',
            type: 'Boolean'
        },
        {
            alias: 'f',
            description: 'Explicitly specify the formatters to be used',
            option: 'formatters',
            type: 'String'
        },
        {
            alias: 'r',
            description: 'Explicitly specify the hints to be used',
            option: 'hints',
            type: 'String'
        },
        {
            alias: 't',
            default: 'off',
            description: 'DEPRECATED: Explicitly specify if enable telemetry or not',
            enum: ['on', 'off'],
            option: 'telemetry',
            type: 'String'
        },
        {
            alias: 'o',
            description: `Save the formatter output to a file, in case of 'html' or 'excel' formatter, save the result with the name specified`,
            option: 'output',
            type: 'String'
        },
        {
            alias: 'l',
            description: 'Explicity specify the language to use',
            option: 'language',
            type: 'String'
        }
    ],
    prepend: 'hint [options] https://url.com'
});
