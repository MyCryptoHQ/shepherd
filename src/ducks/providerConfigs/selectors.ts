import { RootState } from '@src/ducks';
import { providerStorage } from '@src/providers';
import RpcProvider from '@src/providers/rpc';

export const getProviderConfigs = (state: RootState) => state.providerConfigs;

export const getProviderConfigById = (state: RootState, id: string) =>
  getProviderConfigs(state)[id];

export const providerSupportsMethod = (
  state: RootState,
  id: string,
  method: keyof RpcProvider,
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
