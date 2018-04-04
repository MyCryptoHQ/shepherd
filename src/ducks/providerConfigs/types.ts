import { AllProviderMethods, DeepPartial } from '@src/types';

export enum PROVIDER_CONFIG {
  ADD = 'PROVIDER_CONFIG_ADD',
  CHANGE = 'PROVIDER_CONFIG_CHANGE',
  REMOVE = 'PROVIDER_CONFIG_REMOVE',
}

export interface IProviderConfig {
  concurrency: number;
  requestFailureThreshold: number;
  timeoutThresholdMs: number;
  supportedMethods: { [rpcMethod in AllProviderMethods]: boolean };
  network: string;
}

export interface IProviderConfigState {
  [key: string]: IProviderConfig;
}

export interface IAddProviderConfig {
  type: PROVIDER_CONFIG.ADD;
  payload: { id: string; config: IProviderConfig };
}

export interface IChangeProviderConfig {
  type: PROVIDER_CONFIG.CHANGE;
  payload: { id: string; config: DeepPartial<IProviderConfig> };
}

export interface IRemoveProviderConfig {
  type: PROVIDER_CONFIG.REMOVE;
  payload: { id: string };
}

export type ProviderConfigAction =
  | IAddProviderConfig
  | IChangeProviderConfig
  | IRemoveProviderConfig;
