import { IPendingProviderCall } from '@src/ducks/providerBalancer/providerCalls';
import { RootState } from '@src/types';
export declare const getProviderCalls: (state: RootState) => import("./types").ProviderCallsState;
export declare const getProviderCallById: (state: RootState, id: number) => import("./types").ProviderCallState;
export declare const isStaleCall: (state: RootState, callId: number) => boolean;
export declare const getPendingProviderCallsByProviderId: (state: RootState, providerId: string) => number;
export declare const getAllPendingCalls: (state: RootState) => IPendingProviderCall[];
