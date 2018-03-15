import { RootState } from '@src/ducks';
import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';

export const getBalancerConfig = (state: RootState) =>
  getProviderBalancer(state).balancerConfig;

export const getManualMode = (state: RootState) =>
  getBalancerConfig(state).manual;

export const isOffline = (state: RootState) => getBalancerConfig(state).offline;

export const getNetwork = (state: RootState) =>
  getBalancerConfig(state).network;

export const getProviderCallRetryThreshold = (state: RootState) =>
  getBalancerConfig(state).providerCallRetryThreshold;
