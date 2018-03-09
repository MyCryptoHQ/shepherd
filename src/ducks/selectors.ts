import { RootState } from '@src/ducks';
import {
  getProviderConfigs,
  IProviderConfig,
} from '@src/ducks/providerConfigs/configs';
import { getNetwork } from '@src/ducks/providerBalancer/balancerConfig/selectors';

export const getAllProvidersOfCurrentNetwork = (state: RootState) => {
  const allProvidersOfNetworkId: { [key: string]: IProviderConfig } = {};
  const networkId = getNetwork(state);
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
