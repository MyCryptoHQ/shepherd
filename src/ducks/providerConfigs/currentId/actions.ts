import { ChangeProviderConfigAction, PROVIDER_CURRENT_CONFIG } from './types';

export const changeProviderConfig = (
  payload: ChangeProviderConfigAction['payload'],
): ChangeProviderConfigAction => ({ type: PROVIDER_CURRENT_CONFIG.CHANGE, payload });
