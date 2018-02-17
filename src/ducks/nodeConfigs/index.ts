import { NodeConfigState, nodeConfigReducer } from './configs';
import { CurrentNodeIdState, currentNodeIdReducer } from './currentId';

import { combineReducers } from 'redux';

export interface NodeConfigState {
  config: NodeConfigState;
  currentId: CurrentNodeIdState;
}

export const nodeConfigs = combineReducers({
  config: nodeConfigReducer,
  currentConfig: currentNodeIdReducer,
});
