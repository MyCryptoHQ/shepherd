import { networkConfigs, NetworkConfigState } from '@src/ducks/networkConfigs';
import { nodeBalancer, NodeBalancerState } from '@src/ducks/nodeBalancer';
import { nodeConfigs, NodeConfigState } from '@src/ducks/nodeConfigs';
import { combineReducers } from 'redux';

export interface RootState {
  networkConfigs: NetworkConfigState;
  nodeBalancer: NodeBalancerState;
  nodeConfigs: NodeConfigState;
}

export const rootReducer = combineReducers({
  networkConfigs,
  nodeBalancer,
  nodeConfigs,
});
