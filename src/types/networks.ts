export enum DefaultNetworkIds {
  ETH = 'ETH',
  Ropsten = 'Ropsten',
  Kovan = 'Kovan',
  Rinkeby = 'Rinkeby',
  ETC = 'ETC',
  UBQ = 'UBQ',
  EXP = 'EXP',
}

export interface NetworkConfig {
  isCustom: false; // used for type guards
  name: DefaultNetworkIds;
  chainId: number;
}
