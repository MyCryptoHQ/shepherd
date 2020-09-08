import { BalancerAction } from '../balancerConfig/types';
import { ProviderCallAction } from '../providerCalls/types';
import { WorkerAction } from '../workers/types';
import { IProviderStatsState, ProviderStatsAction } from './types';
declare type NReducer<T> = (state: IProviderStatsState, action: T) => IProviderStatsState;
export declare const providerStatsReducer: NReducer<ProviderStatsAction | WorkerAction | ProviderCallAction | BalancerAction>;
export {};
