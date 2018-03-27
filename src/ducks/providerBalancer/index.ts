import { combineReducers } from 'redux';
import { balancerConfigReducer } from './balancerConfig';
import { providerCallsReducer } from './providerCalls';
import { providerStatsReducer } from './providerStats';
import { workerReducer } from './workers';
import { ProviderBalancerState } from './types';

export * from './types';
export const providerBalancer = combineReducers<ProviderBalancerState>({
  providerStats: providerStatsReducer,
  workers: workerReducer,
  balancerConfig: balancerConfigReducer,
  providerCalls: providerCallsReducer,
});
