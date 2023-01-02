"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const parse_json_1 = require("../src/parse-json");
(0, ava_1.default)('parseJSON should parse the json', (t) => {
    const json = {
        a: 'a value',
        b: 'b value'
    };
    const parsedJSON = (0, parse_json_1.parseJSON)(JSON.stringify(json, null, 4));
    t.deepEqual(parsedJSON.data, json);
});
(0, ava_1.default)('getLocation should return the right location', (t) => {
    const json = {
        a: 'a value',
        b: 'b value'
    };
    const parsedJSON = (0, parse_json_1.parseJSON)(JSON.stringify(json, null, 4));
    const actualLocation = parsedJSON.getLocation('a');
    t.deepEqual(parsedJSON.data, json);
    t.deepEqual(actualLocation, {
        column: 5,
        line: 1
    });
});
(0, ava_1.default)(`getLocation should return position {0, 0} if it doesn't found the path`, (t) => {
    const json = {
        a: 'a value',
        b: 'b value'
    };
    const parsedJSON = (0, parse_json_1.parseJSON)(JSON.stringify(json, null, 4));
    const actualLocation = parsedJSON.getLocation('c');
    t.deepEqual(parsedJSON.data, json);
    t.deepEqual(actualLocation, {
        column: 0,
        line: 0
    });
});
(0, ava_1.default)('scope should return the right scope', (t) => {
    const json = {
        a: 'a value',
        b: 'b value'
    };
    const parsedJSON = (0, parse_json_1.parseJSON)(JSON.stringify(json, null, 4));
    const scope = parsedJSON.scope('a');
    t.deepEqual(parsedJSON.data, json);
    t.is(scope.data, 'a value');
});
(0, ava_1.default)(`scope should return null if it doesn't found the path`, (t) => {
    const json = {
        a: 'a value',
        b: 'b value'
    };
    const parsedJSON = (0, parse_json_1.parseJSON)(JSON.stringify(json, null, 4));
    const scope = parsedJSON.scope('a.b');
    t.deepEqual(parsedJSON.data, json);
    t.is(scope, null);
});
