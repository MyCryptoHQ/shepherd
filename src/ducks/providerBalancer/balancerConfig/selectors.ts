import { RootState } from '@src/ducks';
import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';

export const getBalancerConfig = (state: RootState) =>
  getProviderBalancer(state).balancerConfig;

export const isManualMode = (state: RootState) =>
  getBalancerConfig(state).manual;

export const isOffline = (state: RootState) => getBalancerConfig(state).offline;
