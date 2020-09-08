import { IProviderCall, IProviderCallTimeout } from '@src/ducks/providerBalancer/providerCalls';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { RootState, StrIdx } from '@src/types';
export declare const providerExceedsRequestFailureThreshold: (state: RootState, { payload }: IProviderCallTimeout) => boolean;
export declare const getAllProvidersOfNetwork: (state: RootState, networkId: string) => StrIdx<IProviderConfig>;
export declare const getOnlineProviderIdsOfCurrentNetwork: (state: RootState) => string[];
export declare const getAllMethodsAvailable: (state: RootState) => boolean;
export declare const getAvailableProviderId: (state: RootState, payload: IProviderCall) => string | null;
