import { IProviderStats, IProviderStatsState } from '@src/ducks/providerBalancer/providerStats';
import { RootState } from '@src/types';
export declare const getProviderStats: (state: RootState) => IProviderStatsState;
export declare const getProviderStatsById: (state: RootState, id: string) => Readonly<IProviderStats> | null;
export declare type OnlineProviders = {
    [providerId in keyof IProviderStatsState]: IProviderStatsState[providerId] & {
        isOffline: false;
    };
};
/**
 * @description an available provider === it being online
 * @param state
 */
export declare const getOnlineProviders: (state: RootState) => OnlineProviders;
