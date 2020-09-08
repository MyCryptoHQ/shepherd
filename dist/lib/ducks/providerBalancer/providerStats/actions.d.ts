import { IProviderStatsAdded, IProviderStatsOffline, IProviderStatsOnline, IProviderStatsRemoved } from './types';
export declare const providerOnline: (payload: IProviderStatsOnline['payload']) => IProviderStatsOnline;
export declare const providerOffline: (payload: IProviderStatsOffline['payload']) => IProviderStatsOffline;
export declare const providerAdded: (payload: IProviderStatsAdded['payload']) => IProviderStatsAdded;
export declare const providerRemoved: (payload: IProviderStatsRemoved['payload']) => IProviderStatsRemoved;
