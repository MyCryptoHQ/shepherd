import {
  AddProviderConfigAction,
  PROVIDER_CONFIG,
  RemoveProviderConfigAction,
} from './types';

export const addProviderConfig = (payload: AddProviderConfigAction['payload']): AddProviderConfigAction => ({
  type: PROVIDER_CONFIG.ADD,
  payload,
});

export const removeProviderConfig = (
  payload: RemoveProviderConfigAction['payload'],
): RemoveProviderConfigAction => ({ type: PROVIDER_CONFIG.REMOVE, payload });
