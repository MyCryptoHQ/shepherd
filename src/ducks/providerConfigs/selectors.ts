import { RootState } from '@src/ducks';
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
