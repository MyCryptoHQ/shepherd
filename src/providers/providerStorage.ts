import { MyCryptoCustomProvider } from '@src/providers/custom';
import { EtherscanProvider } from '@src/providers/etherscan';
import { InfuraProvider } from '@src/providers/infura';
import { RPCProvider } from '@src/providers/rpc';
import { Web3Provider } from '@src/providers/web3';
import {
  IProvider,
  IProviderContructor,
  IRPCProvider,
  IRPCProviderContructor,
  IStrIdx,
} from '@src/types';

interface IProviderStorage {
  setClass(
    providerName: string,
    Provider: IProviderContructor | IRPCProviderContructor,
  ): void;
  getClass(providerName: string): IProviderContructor | IRPCProviderContructor;
  setInstance(providerName: string, provider: IProvider | IRPCProvider): void;
  getInstance(providerName: string): IProvider | IRPCProvider;
}

class ProviderStorage implements IProviderStorage {
  private readonly instances: Partial<IStrIdx<IProvider | IRPCProvider>>;
  private readonly classes: Partial<
    IStrIdx<IProviderContructor | IRPCProviderContructor>
  >;

  constructor(
    providers: IStrIdx<IProviderContructor | IRPCProviderContructor> = {},
  ) {
    this.classes = providers;
    this.instances = {};
  }

  /**
   * Sets the class
   * @param providerName
   * @param Provider
   */
  public setClass(
    providerName: string,
    Provider: IProviderContructor | IRPCProviderContructor,
  ) {
    this.classes[providerName] = Provider;
  }

  public getClass(providerName: string) {
    const Provider = this.classes[providerName];
    if (!Provider) {
      throw Error(`${providerName} implementation does not exist in storage`);
    }
    return Provider;
  }

  public setInstance(providerName: string, provider: IProvider | IRPCProvider) {
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
  rpc: RPCProvider,
  etherscan: EtherscanProvider,
  infura: InfuraProvider,
  web3: Web3Provider,
  myccustom: MyCryptoCustomProvider,
});
