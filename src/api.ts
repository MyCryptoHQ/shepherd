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
import { IProviderContructor } from '@src/types';
import {
  balancerInit,
  balancerNetworkSwitchRequested,
  BALANCER,
} from '@src/ducks/providerBalancer/balancerConfig';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { IInitConfig, IShepherd } from '@src/types/api';
import { subscribeToAction } from '@src/saga/watchers/watchActionSubscription';

function waitForNetworkSwitch() {
  return new Promise(res => {
    subscribeToAction({
      trigger: BALANCER.NETWORK_SWITCH_SUCCEEDED,
      callback: res,
    });
  });
}

class Shepherd implements IShepherd {
  public async init({ customProviders, ...config }: IInitConfig = {}) {
    if (customProviders) {
      for (const [customProviderName, Provider] of Object.entries(
        customProviders,
      )) {
        addProvider(customProviderName, Provider);
      }
    }

    if (!config.network) {
      config.network = 'ETH';
    }
    if (!config.manual) {
      config.manual = false;
    }
    if (!config.providerCallRetryThreshold) {
      config.providerCallRetryThreshold = 3;
    }
    const node = createProviderProxy();
    const promise = waitForNetworkSwitch();

    store.dispatch(balancerInit(config));
    await promise;
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

  public async switchNetworks(network: string) {
    const promise = waitForNetworkSwitch();
    const action = balancerNetworkSwitchRequested({ network });
    store.dispatch(action);
    await promise;
  }
}

export default new Shepherd();
