import { combineReducers } from 'redux';
import { balancerConfigReducer, BalancerConfigState } from './balancerConfig';
import { providerCallsReducer, ProviderCallsState } from './providerCalls';
import {
  providerStatsReducer,
  ProviderStatsState as ProviderState,
} from './providerStats';
import { workerReducer, WorkerState } from './workers';

export interface ProviderBalancerState {
  providerStats: ProviderState;
  workers: WorkerState;
  balancerConfig: BalancerConfigState;
  providerCalls: ProviderCallsState;
}

export const providerBalancer = combineReducers<ProviderBalancerState>({
  providerStats: providerStatsReducer,
  workers: workerReducer,
  balancerConfig: balancerConfigReducer,
  providerCalls: providerCallsReducer,
});
