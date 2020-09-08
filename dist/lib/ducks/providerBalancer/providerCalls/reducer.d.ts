import { WorkerAction } from '@src/ducks/providerBalancer/workers';
import { ProviderCallAction } from './types';
export declare const providerCallsReducer: (state: import("../../../types").StrIdx<import("./types").ProviderCallState> | undefined, action: ProviderCallAction | WorkerAction) => import("../../../types").StrIdx<import("./types").ProviderCallState>;
