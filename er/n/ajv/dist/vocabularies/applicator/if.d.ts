import type { CodeKeywordDefinition, ErrorObject, AnySchema } from "../../types";
export declare type IfKeywordError = ErrorObject<"if", {
    failingKeyword: string;
}, AnySchema>;
declare const def: CodeKeywordDefinition;
export default def;
