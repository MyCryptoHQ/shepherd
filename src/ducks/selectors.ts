import { RootState } from '@src/ducks';
import { getCurrentNetworkId } from '@src/ducks/networkConfigs/currentId';
import { getProviderConfigs } from '@src/ducks/providerConfigs/configs';
import { ProviderConfig } from '@src/types/providers';

export const getAllProvidersOfCurrentNetwork = (state: RootState) => {
  const allProvidersOfNetworkId: { [key: string]: ProviderConfig } = {};
  const networkId = getCurrentNetworkId(state);
  const providerConfigs = getProviderConfigs(state);

  return Object.entries(providerConfigs).reduce(
    (allProviders, [currProviderId, currProviderConfig]) => {
      if (currProviderConfig.network !== networkId) {
        return allProviders;
      }
      return { ...allProviders, [currProviderId]: currProviderConfig };
    },
    allProvidersOfNetworkId,
  );
};
