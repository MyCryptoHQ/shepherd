import { ChangeNetworkConfigAction, NETWORK_CURRENT_CONFIG } from './types';

export const changeNetworkConfig = (
  payload: ChangeNetworkConfigAction['payload'],
): ChangeNetworkConfigAction => ({
  type: NETWORK_CURRENT_CONFIG.CHANGE,
  payload,
});
