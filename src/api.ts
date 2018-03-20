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
import { StrIdx, IProviderContructor } from '@src/types';
import {
  balancerInit,
  BalancerConfigInitConfig,
  balancerNetworkSwitchRequested,
} from '@src/ducks/providerBalancer/balancerConfig';
import { IProviderConfig } from '@src/ducks/providerConfigs';

interface IInitConfig extends BalancerConfigInitConfig {
  customProviders?: StrIdx<IProviderContructor>;
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

  public switchNetworks(network: string) {
    const action = balancerNetworkSwitchRequested({ network });
    store.dispatch(action);
  }
}

export default new Shepherd();
