import * as ajv from 'ajv';
import { ProblemLocation } from '@hint/utils-types';
export declare type JSONLocationOptions = {
    at?: 'name' | 'value';
};
export declare type JSONLocationFunction = {
    (path: string, options?: JSONLocationOptions): ProblemLocation | null;
};
export interface IJSONResult {
    data: any;
    getLocation: JSONLocationFunction;
    scope(path: string): IJSONResult | null;
}
export declare type ExtendableConfiguration = {
    extends?: string;
};
export interface IParsingError extends Error {
    innerException: string;
    resource: string;
    code?: string;
}
export interface ISchemaValidationError extends ajv.ErrorObject {
    location?: ProblemLocation;
}
export declare type GroupedError = {
    message: string;
    errors: ISchemaValidationError[];
    location?: ProblemLocation;
};
export declare type SchemaValidationResult = {
    data: any;
    errors: ISchemaValidationError[];
    prettifiedErrors: string[];
    groupedErrors: GroupedError[];
    valid: boolean;
};
//# sourceMappingURL=types.d.ts.map