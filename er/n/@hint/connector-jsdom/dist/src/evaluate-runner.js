"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vm = require("vm");
const jsdom_1 = require("jsdom");
const jsdomutils = require("jsdom/lib/jsdom/living/generated/utils");
const utils_debug_1 = require("@hint/utils-debug");
const utils_connector_tools_1 = require("@hint/utils-connector-tools");
const before_parse_1 = require("./before-parse");
const evaluate_resource_loader_1 = require("./evaluate-resource-loader");
const debug = (0, utils_debug_1.debug)(__filename);
const run = async (data) => {
    const { options = {}, source } = data;
    const requesterOptions = Object.assign({ rejectUnauthorized: !options.ignoreHTTPSErrors }, options.requestOptions);
    const requester = new utils_connector_tools_1.Requester(requesterOptions);
    const result = {
        error: null,
        evaluate: 'result'
    };
    const url = process.argv[2];
    const waitFor = parseInt(process.argv[3], 10);
    const virtualConsole = new jsdom_1.VirtualConsole();
    virtualConsole.on('error', (err) => {
        debug(err);
    });
    virtualConsole.on('jsdomError', (err) => {
        debug(err);
    });
    let html = '';
    let networkData;
    try {
        networkData = await requester.get(url);
        html = networkData.response.body.content;
    }
    catch (error) {
        process.send({ error });
        return;
    }
    const finalUrl = networkData.response.url;
    const jsdom = new jsdom_1.JSDOM(html, {
        beforeParse: (0, before_parse_1.beforeParse)(finalUrl),
        pretendToBeVisual: true,
        resources: new evaluate_resource_loader_1.EvaluateCustomResourceLoader(requesterOptions, finalUrl),
        runScripts: 'dangerously',
        url: finalUrl,
        virtualConsole
    });
    const onLoad = () => {
        return setTimeout(async () => {
            try {
                const script = new vm.Script(source);
                const evaluteResult = await script.runInContext(jsdomutils.implForWrapper(jsdom.window.document)._global);
                result.evaluate = evaluteResult;
            }
            catch (err) {
                result.error = err;
            }
            process.send(result);
        }, waitFor);
    };
    const onError = (error) => {
        debug(`onError: ${error}`);
    };
    jsdom.window.addEventListener('load', onLoad, { once: true });
    jsdom.window.addEventListener('error', onError);
};
process.on('message', run);
