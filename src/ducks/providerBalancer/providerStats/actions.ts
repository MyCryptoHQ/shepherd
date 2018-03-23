import {
  PROVIDER_STATS,
  ProviderStatsAddedAction,
  ProviderStatsOfflineAction,
  ProviderStatsOnlineAction,
  ProviderStatsRemovedAction,
} from './types';

export const providerOnline = (
  payload: ProviderStatsOnlineAction['payload'],
): ProviderStatsOnlineAction => ({
  type: PROVIDER_STATS.ONLINE,
  payload,
});

export const providerOffline = (
  payload: ProviderStatsOfflineAction['payload'],
): ProviderStatsOfflineAction => ({
  type: PROVIDER_STATS.OFFLINE,
  payload,
});

export const providerAdded = (
  payload: ProviderStatsAddedAction['payload'],
): ProviderStatsAddedAction => ({
  type: PROVIDER_STATS.ADDED,
  payload,
});

export const providerRemoved = (
  payload: ProviderStatsRemovedAction['payload'],
): ProviderStatsRemovedAction => ({
  type: PROVIDER_STATS.REMOVED,
  payload,
});
