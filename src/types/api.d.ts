import { StrIdx, IProviderContructor, IProvider } from '@src/types';
import {
  balancerInit,
  BalancerConfigInitConfig,
  balancerNetworkSwitchRequested,
} from '@src/ducks/providerBalancer/balancerConfig';
import { IProviderConfig } from '@src/ducks/providerConfigs';

export interface IInitConfig extends BalancerConfigInitConfig {
  customProviders?: StrIdx<IProviderContructor>;
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
