import { NodeStatsState as NodeState, nodeStatsReducer } from './nodeStats';
import { WorkerState, workerReducer } from './workers';
import { BalancerConfigState, balancerConfigReducer } from './balancerConfig';
import { combineReducers } from 'redux';

export interface NodeBalancerState {
  nodes: NodeState;
  workers: WorkerState;
  balancerConfig: BalancerConfigState;
}

export const nodeBalancer = combineReducers({
  nodeStats: nodeStatsReducer,
  workers: workerReducer,
  balancerConfig: balancerConfigReducer,
});
