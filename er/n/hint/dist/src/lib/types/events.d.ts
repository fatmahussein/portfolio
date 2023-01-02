import { HTMLDocument, HTMLElement } from '@hint/utils-dom';
import { Event } from './event';
import { ElementEvents } from './element-events';
import { Problem } from '@hint/utils-types';
import { Request, Response } from './network';
export * from './event';
export * from './element-events';
export declare type ErrorEvent = Event & {
    error: Error;
};
export declare type ScanStart = Event;
export declare type ScanEnd = Event;
export declare type FetchEnd = Event & {
    element: HTMLElement | null;
    request: Request;
    response: Response;
};
export declare type FetchError = Event & {
    element: HTMLElement | null;
    error: any;
    hops: string[];
};
export declare type FetchStart = Event;
export declare type TraverseStart = Event;
export declare type TraverseEnd = Event & {
    document: HTMLDocument;
};
export declare type TraverseUp = Event & {
    element: HTMLElement;
};
export declare type TraverseDown = Event & {
    element: HTMLElement;
};
export declare type CanEvaluateScript = Event & {
    document: HTMLDocument;
};
export declare type PrintEvent = Event & {
    problems: Problem[];
};
export declare type Events = {
    'can-evaluate::script': CanEvaluateScript;
    'fetch::end::*': FetchEnd;
    'fetch::end::css': FetchEnd;
    'fetch::end::font': FetchEnd;
    'fetch::end::html': FetchEnd;
    'fetch::end::image': FetchEnd;
    'fetch::end::json': FetchEnd;
    'fetch::end::manifest': FetchEnd;
    'fetch::end::script': FetchEnd;
    'fetch::end::txt': FetchEnd;
    'fetch::end::unknown': FetchEnd;
    'fetch::end::xml': FetchEnd;
    'fetch::error': FetchError;
    'fetch::start': FetchStart;
    'fetch::start::target': FetchStart;
    'parse::error::*': ErrorEvent;
    'print': PrintEvent;
    'scan::end': ScanEnd;
    'scan::start': ScanStart;
    'traverse::down': TraverseDown;
    'traverse::end': TraverseEnd;
    'traverse::start': TraverseStart;
    'traverse::up': TraverseUp;
} & ElementEvents;
//# sourceMappingURL=events.d.ts.map