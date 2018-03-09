import { StrIdx, IProviderContructor } from '@src/types';
import RPCProvider from '@src/providers/rpc';
import EtherscanProvider from '@src/providers/etherscan';
import InfuraProvider from '@src/providers/infura';
// import { DefaultNetworkIds } from '@src/types/networks';

export interface IProviderStorage {
  set(providerName: string, Provider: IProviderContructor): IProviderContructor;
  get(providerName: string): IProviderContructor;
}

interface ProviderStorageContructor {
  new (providers: StrIdx<IProviderContructor>): IProviderStorage;
}

class ProviderStorage implements IProviderStorage {
  constructor(providers: StrIdx<IProviderContructor>) {
    this.availableImplementations = providers;
  }

  private availableImplementations: Partial<StrIdx<IProviderContructor>>;

  public set(providerName: string, Provider: IProviderContructor) {
    this.availableImplementations[providerName] = Provider;
    return Provider;
  }

  public get(providerName: string) {
    const Provider = this.availableImplementations[providerName];
    if (!Provider) {
      throw Error(`${providerName} implementation does not exist in storage`);
    }
    return Provider;
  }
}

function createProviderStorage(
  ctor: ProviderStorageContructor,
  providers: StrIdx<IProviderContructor>,
) {
  return new ctor(providers);
}

export function initProviderStorage(
  customProviders: StrIdx<IProviderContructor>,
) {
  const defaultProviders: StrIdx<IProviderContructor> = {
    eth_mycrypto:
      // network: DefaultNetworkIds.ETH,
      RPCProvider, //('https://api.mycryptoapi.com/eth'),
    eth_ethscan:
      // network: DefaultNetworkIds.ETH,
      EtherscanProvider, //('https://api.etherscan.io/api'),
    eth_infura:
      // network: DefaultNetworkIds.ETH,
      InfuraProvider, //('https://mainnet.infura.io/mew'),
    rop_infura:
      // network: DefaultNetworkIds.Ropsten,
      InfuraProvider, //('https://ropsten.infura.io/mew'),
    kov_ethscan:
      // network: DefaultNetworkIds.Kovan,
      EtherscanProvider, //('https://kovan.etherscan.io/api'),
    rin_ethscan:
      // network: DefaultNetworkIds.Rinkeby,
      EtherscanProvider, //('https://rinkeby.etherscan.io/api'),
    rin_infura:
      // network: DefaultNetworkIds.Rinkeby,
      InfuraProvider, //('https://rinkeby.infura.io/mew'),
    etc_epool:
      // network: DefaultNetworkIds.ETC,
      RPCProvider, //('https://mewapi.epool.io'),
    ubq:
      // network: DefaultNetworkIds.UBQ,
      RPCProvider, //('https://pyrus2.ubiqscan.io'),
    exp_tech:
      // network: DefaultNetworkIds.EXP,:
      RPCProvider, //('https://provider.expanse.tech/'),
  };

  return createProviderStorage(ProviderStorage, {
    ...defaultProviders,
    ...customProviders,
  });
}
