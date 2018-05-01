import {
  BalancerConfigInitConfig,
  balancerInit,
  balancerNetworkSwitchRequested,
} from '@src/ducks/providerBalancer/balancerConfig';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { IProvider, IProviderContructor, IStrIdx } from '@src/types';
import { Store } from 'redux';

export interface IInitConfig extends BalancerConfigInitConfig {
  customProviders?: IStrIdx<IProviderContructor>;
  storeRoot?: string;
  store?: Store<any>;
}

export interface IShepherd {
  init(config: IInitConfig): Promise<IProvider>;
  addProvider(providerName: string, Provider: IProviderContructor): void;
  useProvider(
    providerName: string,
    instanceName: string,
    config: IProviderConfig,
    ...args: any[]
  ): void;
  switchNetworks(network: string): Promise<void>;
  manual(providerId: string, skipOfflineCheck: boolean): Promise<string>;
  auto(): void;
  enableLogging(): void;
}
