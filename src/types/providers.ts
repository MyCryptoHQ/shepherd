import Web3Provider from '@src/providers/web3';
import RPCProvider from '@src/providers/rpc';
import MCCProvider from '@src/providers/custom';
import { DefaultNetworkIds } from '@src/types/networks';

export interface MCCProviderConfig {
  id: string;
  isCustom: true;
  name: string;
  lib: MCCProvider;
  pLib: MCCProvider;
  service: 'your custom provider';
  url: string;
  port: number;
  network: string;
  auth?: {
    username: string;
    password: string;
  };
}

export interface StaticProviderConfig {
  isCustom: false;
  network: DefaultNetworkIds;
  lib: RPCProvider | Web3Provider;
  pLib: RPCProvider | Web3Provider;
  service: string;
  hidden?: boolean;
}

export enum StaticProviderId {
  ETH_MYCRYPTO = 'eth_mycrypto',
  ETH_ETHSCAN = 'eth_ethscan',
  ETH_INFURA = 'eth_infura',
  ROP_INFURA = 'rop_infura',
  KOV_ETHSCAN = 'kov_ethscan',
  RIN_ETHSCAN = 'rin_ethscan',
  RIN_INFURA = 'rin_infura',
  ETC_EPOOL = 'etc_epool',
  UBQ = 'ubq',
  EXP_TECH = 'exp_tech',
}

export type StaticProviderWithWeb3Id = StaticProviderId | 'web3';

export type ProviderConfig = MCCProviderConfig | StaticProviderConfig;
