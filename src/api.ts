import { store } from './ducks';

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
  balancerInit,
  BalancerConfigInitConfig,
} from '@src/ducks/providerBalancer/balancerConfig';
import { IProviderConfig } from '@src/ducks/providerConfigs';

interface IInitConfig extends BalancerConfigInitConfig {
  customProviders?: StrIdx<IProviderContructor>;
}

export interface IExternalApi {
  init: () => IProvider;
  addProvider: typeof addProvider;
  useProvider: typeof useProvider;
  switchNetwork: (network: string) => void;
}

class Shepherd {
  public init(config: IInitConfig = {}) {
    if (config.customProviders) {
      for (const [customProviderName, Provider] of Object.entries(
        config.customProviders,
      )) {
        addProvider(customProviderName, Provider);
      }
    }

    const node = createProviderProxy();

    store.dispatch(balancerInit(config));
    return node;
  }

  public addProvider(providerName: string, Provider: IProviderContructor) {
    addProvider(providerName, Provider);
  }

  public useProvider(
    providerName: string,
    instanceName: string,
    config: IProviderConfig,
    ...args: any[]
  ) {
    useProvider(providerName, instanceName, config, ...args);
  }
}

export default new Shepherd();
