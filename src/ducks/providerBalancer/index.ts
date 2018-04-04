import { combineReducers } from 'redux';
import { balancerConfigReducer } from './balancerConfig';
import { providerCallsReducer } from './providerCalls';
import { providerStatsReducer } from './providerStats';
import { IProviderBalancerState } from './types';
import { workerReducer } from './workers';

export * from './types';
export const providerBalancer = combineReducers<IProviderBalancerState>({
  providerStats: providerStatsReducer,
  workers: workerReducer,
  balancerConfig: balancerConfigReducer,
  providerCalls: providerCallsReducer,
});
