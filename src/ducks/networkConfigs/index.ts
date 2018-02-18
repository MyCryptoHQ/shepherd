import { NetworkConfigState, networkConfigReducer } from './configs';
import {
  CurrentNetworkIdState,
  currentNetworkConfigReducer,
} from './currentId';
import { combineReducers } from 'redux';

export * from './selectors';

export interface NetworkConfigState {
  config: NetworkConfigState;
  currentId: CurrentNetworkIdState;
}

export const networkConfigs = combineReducers({
  config: networkConfigReducer,
  currentId: currentNetworkConfigReducer,
});
