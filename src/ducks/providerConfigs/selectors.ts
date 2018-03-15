import { RootState } from '@src/ducks';
import RpcProvider from '@src/providers/rpc';

export const getProviderConfigs = (state: RootState) => state.providerConfigs;

export const getProviderConfigById = (state: RootState, id: string | null) =>
  id ? getProviderConfigs(state)[id] : null;

export const providerSupportsMethod = (
  state: RootState,
  id: string,
  method: keyof RpcProvider,
): boolean => {
  const config = getProviderConfigById(state, id);
  return !!(config && config.supportedMethods[method]);
};
