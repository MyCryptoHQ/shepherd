import { ProviderConfig } from '@src/types/providers';

export type ProviderConfigState = { [key: string]: ProviderConfig };

export enum PROVIDER_CONFIG {
  ADD = 'PROVIDER_CONFIG_ADD',
  REMOVE = 'PROVIDER_CONFIG_REMOVE',
}

export interface AddProviderConfigAction {
  type: PROVIDER_CONFIG.ADD;
  payload: { id: string; config: ProviderConfig };
}

export interface RemoveProviderConfigAction {
  type: PROVIDER_CONFIG.REMOVE;
  payload: { id: string };
}

export type ProviderConfigAction =
  | AddProviderConfigAction
  | RemoveProviderConfigAction;
