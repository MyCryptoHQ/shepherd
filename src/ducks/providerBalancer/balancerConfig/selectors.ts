import { IProviderCallTimeout } from '@src/ducks/providerBalancer/providerCalls';
import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';
import { IRootState } from '@src/types';

export const getBalancerConfig = (state: IRootState) =>
  getProviderBalancer(state).balancerConfig;

export const getManualMode = (state: IRootState) =>
  getBalancerConfig(state).manual;

export const isOffline = (state: IRootState) =>
  getBalancerConfig(state).offline;

export const getNetwork = (state: IRootState) =>
  getBalancerConfig(state).network;

export const getProviderCallRetryThreshold = (state: IRootState) =>
  getBalancerConfig(state).providerCallRetryThreshold;

export const isSwitchingNetworks = (state: IRootState) =>
  getBalancerConfig(state).networkSwitchPending;

export const callMeetsBalancerRetryThreshold = (
  state: IRootState,
  { payload: { providerCall } }: IProviderCallTimeout,
) => {
  const providerCallRetryThreshold = getProviderCallRetryThreshold(state);

  // checks the current call to see if it has failed more than the configured number
  return providerCall.numOfRetries >= providerCallRetryThreshold;
};
