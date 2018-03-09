import { RootState } from '@src/ducks';
import { getProviders } from '@src/ducks/providerConfigs/selectors';

export const getCurrentProviderId = (state: RootState) =>
  getProviders(state).currentId;
