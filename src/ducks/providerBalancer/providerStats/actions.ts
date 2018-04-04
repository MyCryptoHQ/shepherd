import {
  IProviderStatsAdded,
  IProviderStatsOffline,
  IProviderStatsOnline,
  IProviderStatsRemoved,
  PROVIDER_STATS,
} from './types';

export const providerOnline = (
  payload: IProviderStatsOnline['payload'],
): IProviderStatsOnline => ({
  type: PROVIDER_STATS.ONLINE,
  payload,
});

export const providerOffline = (
  payload: IProviderStatsOffline['payload'],
): IProviderStatsOffline => ({
  type: PROVIDER_STATS.OFFLINE,
  payload,
});

export const providerAdded = (
  payload: IProviderStatsAdded['payload'],
): IProviderStatsAdded => ({
  type: PROVIDER_STATS.ADDED,
  payload,
});

export const providerRemoved = (
  payload: IProviderStatsRemoved['payload'],
): IProviderStatsRemoved => ({
  type: PROVIDER_STATS.REMOVED,
  payload,
});
