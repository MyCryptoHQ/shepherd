import {
  CurrentNodeIdState,
  NODE_CURRENT_CONFIG,
  ChangeNodeConfigAction,
} from './types';

const INITIAL_STATE = null;

const currentConfigReducer = (
  state: CurrentNodeIdState = INITIAL_STATE,
  action: ChangeNodeConfigAction,
) => {
  switch (action.type) {
    case NODE_CURRENT_CONFIG.CHANGE:
      return action.payload.id;
    default:
      return state;
  }
};

export default currentConfigReducer;
