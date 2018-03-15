import { RootState } from '@src/ducks';
import {
  getProviderConfigs,
  IProviderConfig,
  getProviderConfigById,
  providerSupportsMethod,
} from '@src/ducks/providerConfigs/configs';
import { getNetwork } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import {
  getPendingProviderCallsByProviderId,
  IProviderCall,
} from '@src/ducks/providerBalancer/providerCalls';
import { StrIdx } from '@src/types';
import RpcProvider from '@src/providers/rpc';
import { getOnlineProviders } from '@src/ducks/providerBalancer/providerStats';
import { filterAgainstArr } from '@src/ducks/utils';

export const getAllProvidersOfCurrentNetwork = (state: RootState) => {
  const allProvidersOfNetworkId: StrIdx<IProviderConfig> = {};
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

export const getOnlineProviderIdsOfCurrentNetwork = (state: RootState) => {
  const network = getNetwork(state);
  const onlineProviders = getOnlineProviders(state);
  const providersOfCurrentNetwork = Object.keys(onlineProviders).filter(id => {
    const config = getProviderConfigById(state, id);
    return config && config.network === network;
  });
  return providersOfCurrentNetwork;
};

export const getAllMethodsAvailable = (state: RootState): boolean => {
  const allMethods: (keyof RpcProvider)[] = [
    'ping',
    'sendCallRequest',
    'getBalance',
    'estimateGas',
    'getTransactionCount',
    'getCurrentBlock',
    'sendRawTx',
  ];

  const availableProviderIds = getOnlineProviderIdsOfCurrentNetwork(state);

  // goes through each available provider and reduces all of their
  // available methods into a mapping that contains all supported methods
  const availableMethods: { [key in keyof RpcProvider]: boolean } = {
    estimateGas: false,
    getBalance: false,
    getCurrentBlock: false,
    getTransactionCount: false,
    ping: false,
    sendCallRequest: false,
    sendRawTx: false,
  };

  for (const providerId of availableProviderIds) {
    const providerConfig = getProviderConfigById(state, providerId);
    if (!providerConfig) {
      continue;
    }

    // for the current provider config, OR each rpcMethod against the map
    Object.entries(providerConfig.supportedMethods).forEach(
      ([rpcMethod, isSupported]: [keyof RpcProvider, boolean]) => {
        availableMethods[rpcMethod] =
          availableMethods[rpcMethod] || isSupported;
      },
    );
  }

  // check that all methods are supported by the set of all available providers
  return allMethods.reduce(
    (allAvailable, curMethod) => allAvailable && availableMethods[curMethod],
    true,
  );
};

// available providers -> providers that support the method -> providers that are whitelisted -> prioritized providers -> workers not busy
// TODO: include response time in prioritization
export const getAvailableProviderId = (
  state: RootState,
  payload: IProviderCall,
) => {
  const onlineProviders = getOnlineProviderIdsOfCurrentNetwork(state);

  // filter by providers that can support this method
  const supportsMethod = onlineProviders.filter(providerId =>
    providerSupportsMethod(state, providerId, payload.rpcMethod),
  );

  // filter providers that are in the whitelist if it exists, else continue with providers that support the method
  const payloadProviderWhitelist = payload.providerWhiteList;
  const isWhitelisted = payloadProviderWhitelist
    ? filterAgainstArr(supportsMethod, payloadProviderWhitelist)
    : supportsMethod;

  // grab the providers that are not included in min priority
  const prioritized1 = filterAgainstArr(
    isWhitelisted,
    payload.minPriorityProviderList,
    true,
  );

  // grab the providers that are included
  const prioritized2 = filterAgainstArr(
    isWhitelisted,
    payload.minPriorityProviderList,
  );

  // prioritize the list by using providers with most workers free
  const listToPrioritizeByWorker =
    prioritized1.length > 0 ? prioritized1 : prioritized2;

  let prevProvider: {
    providerId: string;
    numOfRequestsCurrentProcessing: number;
  } | null = null;

  for (const currentProviderId of listToPrioritizeByWorker) {
    const numOfRequestsCurrentProcessing = getPendingProviderCallsByProviderId(
      state,
      currentProviderId,
    );

    // if there's no selected provider yet (aka first iteration)
    // or
    // the current provider has less requests processing, switch the next provider to current provider
    if (
      !prevProvider ||
      prevProvider.numOfRequestsCurrentProcessing >
        numOfRequestsCurrentProcessing
    ) {
      prevProvider = {
        providerId: currentProviderId,
        numOfRequestsCurrentProcessing,
      };
    }
  }

  return prevProvider ? prevProvider.providerId : null;
};
