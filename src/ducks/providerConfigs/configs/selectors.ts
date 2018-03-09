import { RootState } from '@src/ducks';
import { getProviders } from '@src/ducks/providerConfigs/selectors';

export const getProviderConfigs = (state: RootState) =>
  getProviders(state).config;
export const getProviderConfigById = (state: RootState, id: string | null) =>
  id ? getProviderConfigs(state)[id] : null;
