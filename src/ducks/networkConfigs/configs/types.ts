import { NetworkConfig } from '@src/types/networks';

export type NetworkConfigState = { [key: string]: NetworkConfig };

export interface AddNetworkConfigAction {
  type: NETWORK_CONFIG.ADD;
  payload: { id: string; config: NetworkConfig };
}

export interface RemoveNetworkConfigAction {
  type: NETWORK_CONFIG.REMOVE;
  payload: { id: string };
}

export type NetworkConfigAction =
  | AddNetworkConfigAction
  | RemoveNetworkConfigAction;

export enum NETWORK_CONFIG {
  ADD = 'NETWORK_CONFIG_ADD',
  REMOVE = 'NETWORK_CONFIG_REMOVE',
}
