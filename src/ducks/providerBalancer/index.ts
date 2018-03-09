import {
  ProviderStatsState as ProviderState,
  providerStatsReducer,
} from './providerStats';
import { WorkerState, workerReducer } from './workers';
import { BalancerConfigState, balancerConfigReducer } from './balancerConfig';
import { ProviderCallsState, providerCallsReducer } from './providerCalls';
import { combineReducers } from 'redux';

export interface ProviderBalancerState {
  providerStats: ProviderState;
  workers: WorkerState;
  balancerConfig: BalancerConfigState;
  providerCalls: ProviderCallsState;
}

export const providerBalancer = combineReducers({
  providerStats: providerStatsReducer,
  workers: workerReducer,
  balancerConfig: balancerConfigReducer,
  providerCalls: providerCallsReducer,
});
