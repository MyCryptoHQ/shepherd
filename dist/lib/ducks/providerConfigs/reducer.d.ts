import { IProviderConfigState, ProviderConfigAction } from './types';
export declare const INITIAL_STATE: IProviderConfigState;
export declare const providerConfigs: (state: IProviderConfigState | undefined, action: ProviderConfigAction) => IProviderConfigState;
