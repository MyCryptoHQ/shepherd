import { AllProviderMethods, RootState } from '@src/types';
import { IProviderConfigState } from './types';
export declare const getProviderConfigs: (state: RootState) => IProviderConfigState;
export declare const getProviderConfigById: (state: RootState, id: string) => IProviderConfigState[string] | undefined;
export declare const providerSupportsMethod: (state: RootState, id: string, method: AllProviderMethods) => boolean;
export declare const getProviderTimeoutThreshold: (state: RootState, id: string) => number;
export declare const getProviderInstAndTimeoutThreshold: (state: RootState, id: string) => {
    provider: import("../../types").IProvider | import("../../types").IRPCProvider;
    timeoutThreshold: number;
};
