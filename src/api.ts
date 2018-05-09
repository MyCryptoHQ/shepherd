import {
  balancerInit,
  balancerNetworkSwitchRequested,
  setAuto,
  setManualRequested,
} from '@src/ducks/providerBalancer/balancerConfig';
import { getManualMode } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { storeManager } from '@src/ducks/store';
import {
  waitForManualMode,
  waitForNetworkSwitch,
} from '@src/ducks/subscribe/utils';
import { IProviderContructor } from '@src/types';
import { IInitConfig, IShepherd } from '@src/types/api';
import { logger } from '@src/utils/logging';
import { addProvider, createProviderProxy, useProvider } from './providers';

class Shepherd implements IShepherd {
  /**
   *
   * @description Initializes the balancer, returning a single instance of a provider to be used across your application
   * @param {IInitConfig} [{ customProviders, ...config }={}] Initialization configuration parameter, custom providers are
   * your own supplied implementations that adhere to the {IProvider} interface. The {providerCallRetryThreshold} determines
   * how many times a provider can fail a call before its determined to be offline. The {network} is what network the balancer
   * will initialize to, defaulting to 'ETH'. The {storeRoot} is the shepherd rootReducer when using a custom store.
   * E.g If the top level is { foo, shepherdReducer } then `storeRoot` would be `shepherdReducer`. Note that this setting only supports one level of nesting.
   * The {store} is the custom store to use if you want to use your own, make sure to supply the setting above too or else it will not work.
   * {queueTimeout} is the timeout based on when there are pending calls that have not been assigned to a worker. The most common case of this happening
   * is when the balancer is offline and there's calls to the balancer still happening.
   * @returns {Promise<IProvider>} A provider instances to be used for making rpc calls
   * @memberof Shepherd
   */
  public async init({
    customProviders,
    storeRoot,
    store,
    ...config
  }: IInitConfig = {}) {
    if (storeRoot) {
      storeManager.setRoot(storeRoot);
    }

    if (store) {
      storeManager.setStore(store);
    }

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
    const initAction = balancerInit(config);

    const promise = waitForNetworkSwitch(
      storeManager.getStore().dispatch,
      initAction.meta.id,
    );

    storeManager.getStore().dispatch(initAction);
    await promise;
    return node;
  }

  /**
   *
   * @description Adds a custom Provider implementation to be later used and instantiated by useProvider.
   * This library comes with default Provider implementations of 'rpc' 'etherscan' 'infura' 'web3' 'myccustom'
   * already availble for use in useProvider. This method can be used before init
   * @param {string} providerName
   * @param {IProviderContructor} Provider The provider implementation to store for later usage
   * @returns {void}
   * @memberof Shepherd
   */
  public addProvider(providerName: string, Provider: IProviderContructor) {
    addProvider(providerName, Provider);
  }

  /**
   * @description Switches the balancer back to "auto" mode. This is the default mode of the balancer.
   * If the balancer was previously in "manual" mode, this will now instead change it back to normal
   * behaviour, which means balancing between all available providers of the current network
   * @returns {void}
   * @memberof Shepherd
   */
  public auto() {
    storeManager.getStore().dispatch(setAuto());
  }

  /**
   *
   * @description Switches the balancer to "manual" mode. This will switch the balancer's current network
   * to the manual providers network if it is different, then route all requests to the provider. This method
   * can be used before init
   * @param {string} providerId
   * @param {boolean} skipOfflineCheck Will not fail and throw an error if the manual provider switched to
   * is offline
   * @returns {Promise<string>} Resolves when the manual provider has successfully been switched to,
   * returns a promise containing the provider ID switched to
   * @memberof Shepherd
   */
  public async manual(providerId: string, skipOfflineCheck: boolean) {
    const promise = waitForManualMode(storeManager.getStore().dispatch);
    storeManager
      .getStore()
      .dispatch(setManualRequested({ providerId, skipOfflineCheck }));
    return await promise;
  }

  /**
   * @description Add a provider instance to the balancer to be used for incoming rpc calls,
   * this is distinctly different from addProvider, as addProvider does not add any providers to be
   * used for incoming calls. All addProvider does is add a custom implementation to the pool of default
   * implementations that you can specify in this method to be used and have instances created from.
   * This method can be used before init
   * @param {string} providerName The name of the Provider implementation to use as previously defined in
   * either init (as customProviders), or addProvider, or one of the default implementations supplied:
   * 'rpc' 'etherscan' 'infura' 'web3' 'myccustom'
   * @param {string} instanceName The unique name of the instance to be used
   * @param {IProviderConfig} config
   * @param {...any[]} args The constructor arguments to be supplied to the specifed Provider constructor
   * @returns {void}
   * @memberof Shepherd
   */
  public useProvider(
    providerName: string,
    instanceName: string,
    config: IProviderConfig,
    ...args: any[]
  ) {
    useProvider(providerName, instanceName, config, ...args);
  }

  /**
   * @description Switch the network for the balancer to use, all provider instances added by useProvider
   * that match the same network to be swiched to will be used. Can not be used when the balancer is in
   * manual mode, switch to auto mode first.
   * @param {string} network
   * @returns {Promise<void>} Resolves when the network is finished being switched to
   * @memberof Shepherd
   */
  public async switchNetworks(network: string) {
    if (getManualMode(storeManager.getStore().getState())) {
      throw Error(`Can't switch networks when in manual mode!`);
    }
    const action = balancerNetworkSwitchRequested({ network });

    const promise = waitForNetworkSwitch(
      storeManager.getStore().dispatch,
      action.meta.id,
    );
    storeManager.getStore().dispatch(action);
    await promise;
  }

  /**
   * @description enables logging for the library
   * @memberof Shepherd
   */
  public enableLogging() {
    logger.enableLogging();
  }
}

export const shepherd = new Shepherd();
