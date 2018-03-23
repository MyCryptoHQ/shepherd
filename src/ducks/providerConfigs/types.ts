import RpcProvider from '@src/providers/rpc';
import { DeepPartial } from '@src/types';

export enum PROVIDER_CONFIG {
  ADD = 'PROVIDER_CONFIG_ADD',
  CHANGE = 'PROVIDER_CONFIG_CHANGE',
  REMOVE = 'PROVIDER_CONFIG_REMOVE',
}

export interface IProviderConfig {
  concurrency: number;
  requestFailureThreshold: number;
  timeoutThresholdMs: number;
  supportedMethods: { [rpcMethod in keyof RpcProvider]: boolean };
  network: string;
}

export interface ProviderConfigState { [key: string]: IProviderConfig }

export interface AddProviderConfigAction {
  type: PROVIDER_CONFIG.ADD;
  payload: { id: string; config: IProviderConfig };
}

export interface ChangeProviderConfigAction {
  type: PROVIDER_CONFIG.CHANGE;
  payload: { id: string; config: DeepPartial<IProviderConfig> };
}

export interface RemoveProviderConfigAction {
  type: PROVIDER_CONFIG.REMOVE;
  payload: { id: string };
}

export type ProviderConfigAction =
  | AddProviderConfigAction
  | ChangeProviderConfigAction
  | RemoveProviderConfigAction;
