import { IBalancerNetworkSwitchSucceeded } from '@src/ducks/providerBalancer/balancerConfig';
import { IProviderCall, ProviderCallWithPid } from '@src/ducks/providerBalancer/providerCalls';
import { IProviderStats, ProcessedProvider } from '@src/ducks/providerBalancer/providerStats';
import { IWorker } from '@src/ducks/providerBalancer/workers';
import { Task } from 'redux-saga';
export declare const createRetryCall: (currentCall: ProviderCallWithPid) => IProviderCall;
export declare const addProviderIdToCall: (call: IProviderCall, providerId: string) => ProviderCallWithPid;
export declare const trackTime: () => {
    end(): number;
};
export declare const makeProviderStats: (timer: any, isOffline: boolean) => IProviderStats;
export declare const makeWorkerId: (providerId: string, workerNumber: number) => string;
export declare const makeWorker: (providerId: string, task: Task) => IWorker;
declare type NetworkPayload = IBalancerNetworkSwitchSucceeded['payload'];
export declare const reduceProcessedProviders: (processedProviders: ProcessedProvider[], network: string) => NetworkPayload;
export declare const makeRetVal: (error?: Error | null, result?: string | null) => {
    result: string | null;
    error: Error | null;
};
export {};
