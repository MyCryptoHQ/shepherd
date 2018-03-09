require('isomorphic-fetch');
import { store, rootReducer, providerBalancerSaga } from './ducks';

// shepherd.config({callTimeout })
// const myNode = shepherd.init({providers })
// shepherd.add({provider})
// shepherd.remove({provider})
// shepherd.modify({provider: { supportedMethods, maxWorkers } })
// shepherd.only({provider})
// shepherd.delegate([{provider}], [methods] )
// shepherd.switchNetworks(network)

import { createProviderProxy, addProvider, useProvider } from './providers';
import { IProvider, StrIdx, IProviderContructor } from '@src/types';
import {
  balancerNetworkSwitchRequested,
  balancerSetProviderCallTimeoutThreshold,
  balancerInit,
} from '@src/ducks/providerBalancer/balancerConfig';

interface IInitConfig {
  network?: string;
  customProviders?: StrIdx<IProviderContructor>;
  callRetryThreshold?: number;
}

export interface IExternalApi {
  init: () => IProvider;
  addProvider: typeof addProvider;
  useProvider: typeof useProvider;
  switchNetwork: (network: string) => void;
}

export function init(config: IInitConfig) {
  for (const [customProviderName, Provider] of Object.entries(
    config.customProviders,
  )) {
    addProvider(customProviderName, Provider);
  }
  const node = createProviderProxy();
  if (config.network) {
    store.dispatch(balancerNetworkSwitchRequested({ network: config.network }));
  }
  if (config.callRetryThreshold) {
    store.dispatch(
      balancerSetProviderCallTimeoutThreshold({
        threshold: config.callRetryThreshold,
      }),
    );
  }

  store.dispatch(balancerInit());
  return node;
}

export const redux = { store, rootReducer, providerBalancerSaga };
