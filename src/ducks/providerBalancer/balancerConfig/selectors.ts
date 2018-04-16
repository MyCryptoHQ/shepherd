import { IProviderCallTimeout } from '@src/ducks/providerBalancer/providerCalls';
import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';
import { RootState } from '@src/types';

export const getBalancerConfig = (state: RootState) =>
  getProviderBalancer(state).balancerConfig;

export const getManualMode = (state: RootState) =>
  getBalancerConfig(state).manual;

export const isOffline = (state: RootState) => getBalancerConfig(state).offline;

export const getNetwork = (state: RootState) =>
  getBalancerConfig(state).network;

export const getProviderCallRetryThreshold = (state: RootState) =>
  getBalancerConfig(state).providerCallRetryThreshold;

export const isSwitchingNetworks = (state: RootState) =>
  getBalancerConfig(state).networkSwitchPending;

export const callMeetsBalancerRetryThreshold = (
  state: RootState,
  { payload: { providerCall } }: IProviderCallTimeout,
) => {
  const providerCallRetryThreshold = getProviderCallRetryThreshold(state);

  // checks the current call to see if it has failed more than the configured number
  return providerCall.numOfRetries >= providerCallRetryThreshold;
};
