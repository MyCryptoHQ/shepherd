import { RootState } from '@src/ducks';
import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';

export const getProviderStats = (state: RootState) =>
  getProviderBalancer(state).providerStats;

export const getProviderStatsById = (state: RootState, id: string) =>
  getProviderStats(state)[id];
