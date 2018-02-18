import { NodeStatsState as NodeState, nodeStatsReducer } from './nodeStats';
import { WorkerState, workerReducer } from './workers';
import { BalancerConfigState, balancerConfigReducer } from './balancerConfig';
import { NodeCallsState, nodeCallsReducer } from './nodeCalls';
import { combineReducers } from 'redux';

export interface NodeBalancerState {
  nodeStats: NodeState;
  workers: WorkerState;
  balancerConfig: BalancerConfigState;
  nodeCalls: NodeCallsState;
}

export const nodeBalancer = combineReducers({
  nodeStats: nodeStatsReducer,
  workers: workerReducer,
  balancerConfig: balancerConfigReducer,
  nodeCalls: nodeCallsReducer,
});
