/// <reference types="node" />
import { URL } from 'url';
import { ProblemLocation, Severity, CodeFix } from '@hint/utils-types';
import { ProblemDocumentation } from '@hint/utils-types';
import { HTMLElement } from '@hint/utils-dom';
import { Engine } from './engine';
import { Events, HintMetadata, NetworkData, StringKeyOf } from './types';
export declare type CodeLanguage = 'css' | 'html' | 'http' | 'javascript';
export declare type ReportOptions = {
    attribute?: string;
    browsers?: string[];
    codeSnippet?: string;
    content?: string;
    documentation?: ProblemDocumentation[];
    element?: HTMLElement | null;
    location?: ProblemLocation | null;
    severity: Severity;
    forceSeverity?: boolean;
    codeLanguage?: CodeLanguage;
    fixes?: CodeFix[];
};
export declare class HintContext<E extends Events = Events> {
    private id;
    private options;
    private meta;
    private severity;
    private engine;
    private ignoredUrls;
    constructor(hintId: string, engine: Engine<E>, severity: Severity, options: any, meta: HintMetadata, ignoredUrls: RegExp[]);
    get engineKey(): object;
    get pageDOM(): import("@hint/utils-dom").HTMLDocument | undefined;
    get pageContent(): string | undefined;
    get pageHeaders(): import("@hint/utils-types").HttpHeaders | undefined;
    get targetedBrowsers(): string[];
    get hintOptions(): any;
    evaluate(source: string): Promise<any>;
    fetchContent(target: string | URL, headers?: object): Promise<NetworkData>;
    querySelectorAll(selector: string): HTMLElement[];
    private adjustFixLocations;
    findProblemLocation(element: HTMLElement, offset: ProblemLocation | null, attribute?: string): ProblemLocation | null;
    report(resource: string, message: string, options: ReportOptions): void;
    on<K extends StringKeyOf<E>>(event: K, listener: (data: E[K], event: string) => void): void;
    isUrlIgnored(resource: string): boolean;
    get language(): string;
}
//# sourceMappingURL=hint-context.d.ts.map