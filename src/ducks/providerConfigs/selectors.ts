import { getRootState } from '@src/ducks/rootState';
import { providerStorage } from '@src/providers/providerStorage';
import { AllProviderMethods, IRootState } from '@src/types';
import { IProviderConfigState } from './types';

export const getProviderConfigs = (state: IRootState) =>
  getRootState(state).providerConfigs;

export const getProviderConfigById = (
  state: IRootState,
  id: string,
): IProviderConfigState[string] | undefined => getProviderConfigs(state)[id];

export const providerSupportsMethod = (
  state: IRootState,
  id: string,
  method: AllProviderMethods,
): boolean => {
  const config = getProviderConfigById(state, id);
  return !!(config && config.supportedMethods[method]);
};

export const getProviderTimeoutThreshold = (state: IRootState, id: string) => {
  const config = getProviderConfigById(state, id);
  if (!config) {
    throw Error(`Could not find config for provider ${id}`);
  }
  return config.timeoutThresholdMs;
};

export const getProviderInstAndTimeoutThreshold = (
  state: IRootState,
  id: string,
) => {
  const provider = providerStorage.getInstance(id);
  const timeoutThreshold = getProviderTimeoutThreshold(state, id);
  return { provider, timeoutThreshold };
};
