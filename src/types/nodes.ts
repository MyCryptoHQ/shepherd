import Web3Node from '@src/nodes/web3';
import RPCNode from '@src/nodes/rpc';
import MCCNode from '@src/nodes/custom';
import { DefaultNetworkIds } from '@src/types/networks';

export interface MCCNodeConfig {
  id: string;
  isCustom: true;
  name: string;
  lib: MCCNode;
  pLib: MCCNode;
  service: 'your custom node';
  url: string;
  port: number;
  network: string;
  auth?: {
    username: string;
    password: string;
  };
}

export interface StaticNodeConfig {
  isCustom: false;
  network: DefaultNetworkIds;
  lib: RPCNode | Web3Node;
  pLib: RPCNode | Web3Node;
  service: string;
  hidden?: boolean;
}

export enum StaticNodeId {
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

export type StaticNodeWithWeb3Id = StaticNodeId | 'web3';

export type NodeConfig = MCCNodeConfig | StaticNodeConfig;
