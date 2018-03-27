import { BalancerConfigState } from './balancerConfig';
import { ProviderCallsState } from './providerCalls';
import { ProviderStatsState } from './providerStats';
import { WorkerState } from './workers';

export interface ProviderBalancerState {
  providerStats: ProviderStatsState;
  workers: WorkerState;
  balancerConfig: BalancerConfigState;
  providerCalls: ProviderCallsState;
}
