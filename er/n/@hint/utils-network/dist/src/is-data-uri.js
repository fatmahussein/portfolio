"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDataURI = void 0;
const has_protocol_1 = require("./has-protocol");
const isDataURI = (resource) => {
    return (0, has_protocol_1.hasProtocol)(resource, 'data:');
};
exports.isDataURI = isDataURI;
