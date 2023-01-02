/// <reference types="node" />
import { ResourceLoader, FetchOptions, AbortablePromise } from 'jsdom';
export declare class EvaluateCustomResourceLoader extends ResourceLoader {
    private _requester;
    private _baseUrl;
    constructor(options: any, url: string);
    fetch(url: string, options: FetchOptions): AbortablePromise<Buffer>;
}
//# sourceMappingURL=evaluate-resource-loader.d.ts.map