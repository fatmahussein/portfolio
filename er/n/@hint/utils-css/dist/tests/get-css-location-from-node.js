"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const get_css_location_from_node_1 = require("../src/get-css-location-from-node");
(0, ava_1.default)(`If node doesn't have any location info, it should return undefined`, (t) => {
    const result = (0, get_css_location_from_node_1.getCSSLocationFromNode)({ source: {} });
    t.is(result, undefined);
});
(0, ava_1.default)(`If node type is 'atrule' it should return the same start and end position`, (t) => {
    const result = (0, get_css_location_from_node_1.getCSSLocationFromNode)({
        source: {
            start: {
                column: 1,
                line: 5
            }
        },
        type: 'atrule'
    });
    t.is(result.column, 0);
    t.is(result.line, 4);
    t.is(result.endColumn, 0);
    t.is(result.endLine, 4);
});
(0, ava_1.default)(`If node type is 'rule' it should return the same start and end position`, (t) => {
    const result = (0, get_css_location_from_node_1.getCSSLocationFromNode)({
        source: {
            start: {
                column: 1,
                line: 5
            }
        },
        type: 'rule'
    });
    t.is(result.column, 0);
    t.is(result.line, 4);
    t.is(result.endColumn, 0);
    t.is(result.endLine, 4);
});
(0, ava_1.default)(`If node type is 'comment' it should return the same start and end position`, (t) => {
    const result = (0, get_css_location_from_node_1.getCSSLocationFromNode)({
        source: {
            start: {
                column: 1,
                line: 5
            }
        },
        type: 'comment'
    });
    t.is(result.column, 0);
    t.is(result.line, 4);
    t.is(result.endColumn, 0);
    t.is(result.endLine, 4);
});
(0, ava_1.default)(`If node type is decl and the second parameter is not present, it should return the position of the property`, (t) => {
    const result = (0, get_css_location_from_node_1.getCSSLocationFromNode)({
        prop: 'display',
        source: {
            start: {
                column: 1,
                line: 5
            }
        },
        type: 'decl'
    });
    t.is(result.column, 0);
    t.is(result.line, 4);
    t.is(result.endColumn, 7);
    t.is(result.endLine, 4);
});
(0, ava_1.default)(`If node type is decl and between is in one single line, it should return the position of the property value`, (t) => {
    const result = (0, get_css_location_from_node_1.getCSSLocationFromNode)({
        prop: 'display',
        raws: { between: ': ' },
        source: {
            start: {
                column: 1,
                line: 5
            }
        },
        type: 'decl',
        value: '-ms-grid'
    }, { isValue: true });
    t.is(result.column, 9);
    t.is(result.line, 4);
    t.is(result.endColumn, 17);
    t.is(result.endLine, 4);
});
(0, ava_1.default)(`If node type is decl and between the property and the value there is multiple lines, it should return the position of the property value`, (t) => {
    const result = (0, get_css_location_from_node_1.getCSSLocationFromNode)({
        prop: 'display',
        raws: { between: ':\n   /* this is a comment */ ' },
        source: {
            start: {
                column: 1,
                line: 5
            }
        },
        type: 'decl',
        value: '-ms-grid'
    }, { isValue: true });
    t.is(result.column, 27);
    t.is(result.line, 5);
    t.is(result.endColumn, 35);
    t.is(result.endLine, 5);
});
