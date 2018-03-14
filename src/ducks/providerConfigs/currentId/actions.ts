import {
  SwitchCurrentProviderConfigAction,
  PROVIDER_CURRENT_CONFIG,
} from './types';

export const switchCurrentProviderConfig = (
  payload: SwitchCurrentProviderConfigAction['payload'],
): SwitchCurrentProviderConfigAction => ({
  type: PROVIDER_CURRENT_CONFIG.SWITCH,
  payload,
});
