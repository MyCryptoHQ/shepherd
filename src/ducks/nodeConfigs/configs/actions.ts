import {
  AddNodeConfigAction,
  NODE_CONFIG,
  RemoveNodeConfigAction,
} from './types';

export const addNodeConfig = (
  payload: AddNodeConfigAction['payload'],
): AddNodeConfigAction => ({ type: NODE_CONFIG.ADD, payload });

export const removeNodeConfig = (
  payload: RemoveNodeConfigAction['payload'],
): RemoveNodeConfigAction => ({ type: NODE_CONFIG.REMOVE, payload });
