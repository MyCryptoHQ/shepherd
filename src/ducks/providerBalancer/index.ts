import { combineReducers } from 'redux';
import { balancerConfigReducer } from './balancerConfig';
import { providerCallsReducer } from './providerCalls';
import { providerStatsReducer } from './providerStats';
import { ProviderBalancerState } from './types';
import { workerReducer } from './workers';

export * from './types';
export const providerBalancer = combineReducers<ProviderBalancerState>({
  providerStats: providerStatsReducer,
  workers: workerReducer,
  balancerConfig: balancerConfigReducer,
  providerCalls: providerCallsReducer,
});
