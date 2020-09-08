import { IProviderConfig } from '@src/ducks/providerConfigs';
import { IProviderContructor } from '@src/types';
export declare function addProvider(providerName: string, Provider: IProviderContructor): void;
export declare function useProvider(providerName: string, instanceName: string, config: IProviderConfig, ...args: any[]): IProviderConfig;
