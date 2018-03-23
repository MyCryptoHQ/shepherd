import EtherscanProvider from '@src/providers/etherscan';
import InfuraProvider from '@src/providers/infura';
import RPCProvider from '@src/providers/rpc';
import { IProvider, IProviderContructor, StrIdx } from '@src/types';

interface IProviderStorage {
  setClass(providerName: string, Provider: IProviderContructor): void;
  getClass(providerName: string): IProviderContructor;
  setInstance(providerName: string, provider: IProvider): void;
  getInstance(providerName: string): IProvider;
}

class ProviderStorage implements IProviderStorage {
  private instances: Partial<StrIdx<IProvider>>;
  private classes: Partial<StrIdx<IProviderContructor>>;

  constructor(providers: StrIdx<IProviderContructor> = {}) {
    this.classes = providers;
    this.instances = {};
  }

  /**
   * Sets the class
   * @param providerName
   * @param Provider
   */
  public setClass(providerName: string, Provider: IProviderContructor) {
    this.classes[providerName] = Provider;
  }

  public getClass(providerName: string) {
    const Provider = this.classes[providerName];
    if (!Provider) {
      throw Error(`${providerName} implementation does not exist in storage`);
    }
    return Provider;
  }

  public setInstance(providerName: string, provider: IProvider) {
    this.instances[providerName] = provider;
  }

  public getInstance(providerName: string) {
    const provider = this.instances[providerName];
    if (!provider) {
      throw Error(`${providerName} instance does not exist in storage`);
    }
    return provider;
  }
}

export const providerStorage = new ProviderStorage({
  eth_mycrypto: RPCProvider,
  eth_ethscan: EtherscanProvider,
  eth_infura: InfuraProvider,
  rop_infura: InfuraProvider,
  kov_ethscan: EtherscanProvider,
  rin_ethscan: EtherscanProvider,
  rin_infura: InfuraProvider,
  etc_epool: RPCProvider,
  ubq: RPCProvider,
  exp_tech: RPCProvider,
});
