import { ChangeNodeConfigAction, NODE_CURRENT_CONFIG } from './types';

export const changeNodeConfig = (
  payload: ChangeNodeConfigAction['payload'],
): ChangeNodeConfigAction => ({ type: NODE_CURRENT_CONFIG.CHANGE, payload });
