import { combineReducers } from 'redux';
import { balancerConfigReducer } from './balancerConfig';
import * as balancerConfigSelectors from './balancerConfig/selectors';

import { providerCallsReducer } from './providerCalls';
import * as providerCallsSelectors from './providerCalls/selectors';

import { providerStatsReducer } from './providerStats';
import * as providerStatsSelectors from './providerStats/selectors';

import { workerReducer } from './workers';
import * as workersSelectors from './workers/selectors';

import { IProviderBalancerState } from './types';
export * from './types';

export const providerBalancer = combineReducers<IProviderBalancerState>({
  providerStats: providerStatsReducer,
  workers: workerReducer,
  balancerConfig: balancerConfigReducer,
  providerCalls: providerCallsReducer,
});

export const providerBalancerSelectors = {
  balancerConfigSelectors,
  providerCallsSelectors,
  providerStatsSelectors,
  workersSelectors,
};
