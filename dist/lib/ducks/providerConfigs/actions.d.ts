import { IChangeProviderConfig } from '@src/ducks/providerConfigs';
import { IAddProviderConfig, IRemoveProviderConfig } from './types';
export declare const addProviderConfig: (payload: IAddProviderConfig['payload']) => IAddProviderConfig;
export declare const removeProviderConfig: (payload: IRemoveProviderConfig['payload']) => IRemoveProviderConfig;
export declare const changeProviderConfig: (payload: IChangeProviderConfig['payload']) => IChangeProviderConfig;
