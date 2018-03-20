import { RootState } from '@src/ducks';
import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';
import { ProviderCallTimeoutAction } from '@src/ducks/providerBalancer/providerCalls';

export const getBalancerConfig = (state: RootState) =>
  getProviderBalancer(state).balancerConfig;

export const getManualMode = (state: RootState) =>
  getBalancerConfig(state).manual;

export const isOffline = (state: RootState) => getBalancerConfig(state).offline;

export const getNetwork = (state: RootState) =>
  getBalancerConfig(state).network;

export const getProviderCallRetryThreshold = (state: RootState) =>
  getBalancerConfig(state).providerCallRetryThreshold;

export const callMeetsBalancerRetryThreshold = (
  state: RootState,
  { payload: { providerCall } }: ProviderCallTimeoutAction,
) => {
  const providerCallRetryThreshold = getProviderCallRetryThreshold(state);

  // checks the current call to see if it has failed more than the configured number
  return providerCall.numOfRetries >= providerCallRetryThreshold;
};
