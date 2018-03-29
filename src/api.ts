import {
  balancerInit,
  balancerNetworkSwitchRequested,
  setManualRequested,
  setAuto,
} from '@src/ducks/providerBalancer/balancerConfig';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { IProviderContructor } from '@src/types';
import { IInitConfig, IShepherd } from '@src/types/api';
import { store } from './ducks';
import { addProvider, createProviderProxy, useProvider } from './providers';
import { logger } from '@src/utils/logging';
import {
  waitForNetworkSwitch,
  waitForManualMode,
} from '@src/ducks/subscribe/utils';
import { getManualMode } from '@src/ducks/providerBalancer/balancerConfig/selectors';

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

    if (!config.providerCallRetryThreshold) {
      config.providerCallRetryThreshold = 3;
    }
    const node = createProviderProxy();
    const promise = waitForNetworkSwitch(store.dispatch);

    store.dispatch(balancerInit(config));
    await promise;
    return node;
  }

  public addProvider(providerName: string, Provider: IProviderContructor) {
    addProvider(providerName, Provider);
  }

  public auto() {
    store.dispatch(setAuto());
  }
  public async manual(providerId: string, skipOfflineCheck: boolean) {
    const promise = waitForManualMode(store.dispatch);
    store.dispatch(setManualRequested({ providerId, skipOfflineCheck }));
    return await promise;
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
    if (getManualMode(store.getState())) {
      throw Error(`Can't switch networks when in manual mode!`);
    }
    const promise = waitForNetworkSwitch(store.dispatch);
    const action = balancerNetworkSwitchRequested({ network });
    store.dispatch(action);
    await promise;
  }

  public enableLogging() {
    logger.enableLogging();
  }
}

export default new Shepherd();
