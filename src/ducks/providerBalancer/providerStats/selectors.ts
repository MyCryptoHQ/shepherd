import { RootState } from '@src/ducks';
import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';
import { ProviderStatsState } from '@src/ducks/providerBalancer/providerStats';
import { Omit } from '@src/types';

export const getProviderStats = (state: RootState) =>
  getProviderBalancer(state).providerStats;

export const getProviderStatsById = (state: RootState, id: string) =>
  getProviderStats(state)[id];

export type OnlineProviders = {
  [providerId in keyof ProviderStatsState]: Omit<
    ProviderStatsState[providerId],
    'isOffline'
  > & {
    isOffline: false;
  }
};

/**
 * @description an available provider === it being online
 * @param state
 */
export const getOnlineProviders = (state: RootState): OnlineProviders => {
  const providers = getProviderStats(state);
  const initialState: OnlineProviders = {};

  const isOnline = (
    provider: ProviderStatsState[string],
  ): provider is OnlineProviders[string] => !provider.isOffline;

  return Object.entries(providers).reduce(
    (accu, [curProviderId, curProvider]) => {
      if (isOnline(curProvider)) {
        return { ...accu, [curProviderId]: curProvider };
      }
      return accu;
    },
    initialState,
  );
};
