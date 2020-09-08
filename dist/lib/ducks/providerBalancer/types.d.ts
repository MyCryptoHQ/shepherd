import { BalancerAction, IBalancerConfigState } from './balancerConfig';
import { ProviderCallAction, ProviderCallsState } from './providerCalls';
import { IProviderStatsState, ProviderStatsAction } from './providerStats';
import { IWorkerState, WorkerAction } from './workers';
export interface IProviderBalancerState {
    providerStats: IProviderStatsState;
    workers: IWorkerState;
    balancerConfig: IBalancerConfigState;
    providerCalls: ProviderCallsState;
}
export declare type ProviderBalancerAction = BalancerAction | ProviderCallAction | ProviderStatsAction | WorkerAction;
