import { AllProviderMethods, DeepPartial } from '@src/types';

export enum PROVIDER_CONFIG {
  ADD = 'PROVIDER_CONFIG_ADD',
  CHANGE = 'PROVIDER_CONFIG_CHANGE',
  REMOVE = 'PROVIDER_CONFIG_REMOVE',
}

export interface IProviderConfig {
  /**
   * @description The maximum number of concurrent calls to make to the provider instance using this config.
   * This number determines how many workers to spawn to process incoming rpc requests
   */
  concurrency: number;
  /**
   * @description The threshold of failed calls before deeming a provider to be offline
   * (which means it will no longer have rpc calls routed to it), which will then be polled until it responds.
   * If it responds, it will be changed to an online state and continue to have applicable calls as outlined in supportedMethods routed to it
   */
  requestFailureThreshold: number;
  /**
   * @description How long to wait on an rpc call (also applies to the initial ping to determine if a provider is online) before determining that it has timed out
   */
  timeoutThresholdMs: number;
  /**
   * @description All supported rpc methods by this provider config,
   * disable a method for a config by setting it to false, this will
   * prevent any rpc calls set to false to be routed to the provider instance using this config
   */
  supportedMethods: { [rpcMethod in AllProviderMethods]: boolean };
  /**
   * @description The associated network name of this provider config to be used by the balancer when switching networks
   */
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
