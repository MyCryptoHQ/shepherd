import { addProviderConfig, IProviderConfig } from '@src/ducks/providerConfigs';
import { storeManager } from '@src/ducks/store';
import { IProviderContructor } from '@src/types';
import { providerStorage } from './providerStorage';

export function addProvider(
  providerName: string,
  Provider: IProviderContructor,
) {
  return providerStorage.setClass(providerName, Provider);
}

export function useProvider(
  providerName: string,
  instanceName: string,
  config: IProviderConfig,
  ...args: any[]
) {
  const Provider = providerStorage.getClass(providerName);
  const provider = new Provider(...args);
  providerStorage.setInstance(instanceName, provider);
  const action = addProviderConfig({ config, id: instanceName });
  storeManager.getStore().dispatch(action);
  return config;
}
