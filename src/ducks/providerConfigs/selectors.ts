import { RootState } from '@src/ducks';
import { getProviderConfigById } from '@src/ducks/providerConfigs/configs';
import { getCurrentProviderId } from '@src/ducks/providerConfigs/currentId';

export const getProviders = (state: RootState) => state.providerConfigs;

export const getCurrentProviderConfig = (state: RootState) =>
  getProviderConfigById(state, getCurrentProviderId(state));
