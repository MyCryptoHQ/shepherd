import { WorkerAction } from '@src/ducks/providerBalancer/workers';
import { ProviderCallAction, ProviderCallsState } from './types';
export declare const providerCallsReducer: (state: ProviderCallsState | undefined, action: ProviderCallAction | WorkerAction) => ProviderCallsState;
