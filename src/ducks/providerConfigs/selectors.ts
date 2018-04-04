import { providerStorage } from '@src/providers/providerStorage';
import { AllProviderMethods, RootState } from '@src/types';
import { IProviderConfigState } from './types';

export const getProviderConfigs = (state: RootState) => state.providerConfigs;

export const getProviderConfigById = (
  state: RootState,
  id: string,
): IProviderConfigState[string] | undefined => getProviderConfigs(state)[id];

export const providerSupportsMethod = (
  state: RootState,
  id: string,
  method: AllProviderMethods,
): boolean => {
  const config = getProviderConfigById(state, id);
  return !!(config && config.supportedMethods[method]);
};

export const getProviderTimeoutThreshold = (state: RootState, id: string) => {
  const config = getProviderConfigById(state, id);
  if (!config) {
    throw Error(`Could not find config for provider ${id}`);
  }
  return config.timeoutThresholdMs;
};

export const getProviderInstAndTimeoutThreshold = (
  state: RootState,
  id: string,
) => {
  const provider = providerStorage.getInstance(id);
  const timeoutThreshold = getProviderTimeoutThreshold(state, id);
  return { provider, timeoutThreshold };
};
