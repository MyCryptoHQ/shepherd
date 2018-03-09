import { IProviderContructor } from '@src/types';
import { IProviderConfig } from '@src/ducks/providerConfigs/configs';
import { providerStorage } from './providerStorage';

export function addProvider(
  providerName: string,
  Provider: IProviderContructor,
) {
  return providerStorage.setClass(providerName, Provider);
}

export function useProvider(
  providerName: string,
  config: IProviderConfig,
  ...args: any[]
) {
  const Provider = providerStorage.getClass(providerName);
  const provider = new Provider(...args);
  providerStorage.setInstance(providerName, provider);
  return config;
}
