import { IChangeProviderConfig } from '@src/ducks/providerConfigs';
import {
  IAddProviderConfig,
  IRemoveProviderConfig,
  PROVIDER_CONFIG,
} from './types';

export const addProviderConfig = (
  payload: IAddProviderConfig['payload'],
): IAddProviderConfig => ({
  type: PROVIDER_CONFIG.ADD,
  payload,
});

export const removeProviderConfig = (
  payload: IRemoveProviderConfig['payload'],
): IRemoveProviderConfig => ({ type: PROVIDER_CONFIG.REMOVE, payload });

export const changeProviderConfig = (
  payload: IChangeProviderConfig['payload'],
): IChangeProviderConfig => ({ type: PROVIDER_CONFIG.CHANGE, payload });
