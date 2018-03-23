import { ChangeProviderConfigAction } from '@src/ducks/providerConfigs';
import {
  AddProviderConfigAction,
  PROVIDER_CONFIG,
  RemoveProviderConfigAction,
} from './types';

export const addProviderConfig = (
  payload: AddProviderConfigAction['payload'],
): AddProviderConfigAction => ({
  type: PROVIDER_CONFIG.ADD,
  payload,
});

export const removeProviderConfig = (
  payload: RemoveProviderConfigAction['payload'],
): RemoveProviderConfigAction => ({ type: PROVIDER_CONFIG.REMOVE, payload });

export const changeProviderConfig = (
  payload: ChangeProviderConfigAction['payload'],
): ChangeProviderConfigAction => ({ type: PROVIDER_CONFIG.CHANGE, payload });
