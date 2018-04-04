import { IBalancerConfigState } from './balancerConfig';
import { ProviderCallsState } from './providerCalls';
import { IProviderStatsState } from './providerStats';
import { IWorkerState } from './workers';

export interface IProviderBalancerState {
  providerStats: IProviderStatsState;
  workers: IWorkerState;
  balancerConfig: IBalancerConfigState;
  providerCalls: ProviderCallsState;
}
