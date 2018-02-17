export enum StaticNetworkIds {
  ETH = 'ETH',
  Ropsten = 'Ropsten',
  Kovan = 'Kovan',
  Rinkeby = 'Rinkeby',
  ETC = 'ETC',
  UBQ = 'UBQ',
  EXP = 'EXP',
}

export interface BlockExplorerConfig {
  origin: string;
  txUrl(txHash: string): string;
  addressUrl(address: string): string;
}

export interface Token {
  address: string;
  symbol: string;
  decimal: number;
  error?: string | null;
}

export interface NetworkContract {
  name: StaticNetworkIds;
  address?: string;
  abi: string;
}

export interface DPathFormats {
  trezor: DPath;
  ledgerNanoS: DPath;
  mnemonicPhrase: DPath;
}

export interface StaticNetworkConfig {
  isCustom: false; // used for type guards
  name: StaticNetworkIds;
  unit: string;
  color?: string;
  blockExplorer?: BlockExplorerConfig;
  tokenExplorer?: {
    name: string;
    address(address: string): string;
  };
  chainId: number;
  tokens: Token[];
  contracts: NetworkContract[] | null;
  dPathFormats: DPathFormats;
  isTestnet?: boolean;
}

export interface CustomNetworkConfig {
  isCustom: true; // used for type guards
  isTestnet?: boolean;
  name: string;
  unit: string;
  chainId: number;
  dPathFormats: DPathFormats | null;
}

export type NetworkConfig = StaticNetworkConfig | CustomNetworkConfig;
