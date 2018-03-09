import {
  PROVIDER,
  ProviderOnlineAction,
  ProviderOfflineAction,
  ProviderAddedAction,
  ProviderRemovedAction,
} from './types';

export const providerOnline = (
  payload: ProviderOnlineAction['payload'],
): ProviderOnlineAction => ({
  type: PROVIDER.ONLINE,
  payload,
});

export const providerOffline = (
  payload: ProviderOfflineAction['payload'],
): ProviderOfflineAction => ({
  type: PROVIDER.OFFLINE,
  payload,
});

export const providerAdded = (
  payload: ProviderAddedAction['payload'],
): ProviderAddedAction => ({
  type: PROVIDER.ADDED,
  payload,
});

export const providerRemoved = (
  payload: ProviderRemovedAction['payload'],
): ProviderRemovedAction => ({
  type: PROVIDER.REMOVED,
  payload,
});
