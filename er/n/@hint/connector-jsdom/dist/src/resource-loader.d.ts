/// <reference types="node" />
import { HTMLDocument } from '@hint/utils-dom';
import { ResourceLoader, FetchOptions, AbortablePromise } from 'jsdom';
import JSDOMConnector from './connector';
export default class CustomResourceLoader extends ResourceLoader {
    private _connector;
    private _HTMLDocument;
    constructor(connector: JSDOMConnector, htmlDocument: HTMLDocument);
    fetch(url: string, options: FetchOptions): AbortablePromise<Buffer>;
}
//# sourceMappingURL=resource-loader.d.ts.map