import { IProviderCallFailed, IProviderCallFlushed, IProviderCallRequested, IProviderCallSucceeded, IProviderCallTimeout } from './types';
export declare const providerCallRequested: (payload: IProviderCallRequested['payload']) => IProviderCallRequested;
export declare const providerCallTimeout: (payload: IProviderCallTimeout['payload']) => IProviderCallTimeout;
export declare const providerCallFailed: (payload: IProviderCallFailed['payload']) => IProviderCallFailed;
export declare const providerCallFlushed: (payload: IProviderCallFlushed['payload']) => IProviderCallFlushed;
export declare const providerCallSucceeded: (payload: IProviderCallSucceeded['payload']) => IProviderCallSucceeded;
