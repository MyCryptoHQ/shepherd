import {
  CurrentNodeIdState,
  NODE_CURRENT_CONFIG,
  ChangeNodeConfigAction,
} from './types';

const currentConfigReducer = (
  state: CurrentNodeIdState,
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
