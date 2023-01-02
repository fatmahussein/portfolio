export declare type MessageName = 'compressedWithBrotliOverHTTPS' | 'compressedWithBrotliOverHTTPSAgent' | 'compressedWithGzipAgent' | 'compressedWithZopfliAgent' | 'couldNotBeFetched' | 'couldNotBeFetchedBrotli' | 'couldNotBeFetchedGzip' | 'couldNotBeFetchedUncompressed' | 'description' | 'name' | 'noCompressedBrotliOverHTTP' | 'responseBiggerThan' | 'responseSameSize' | 'responseShouldBeCompressedGzip' | 'responseShouldIncludeContentEncoding' | 'responseShouldIncludeVary' | 'responseShouldNotBeCompressed' | 'shouldNotBeCompressed' | 'shouldNotBeCompressedWithIdentity' | 'shouldNotIncludeContentEncoding' | 'shouldNotIncludeWithIdentity';
export declare const getMessage: (message: MessageName, language: string, substitutions?: string | string[] | undefined) => string;
//# sourceMappingURL=i18n.import.d.ts.map