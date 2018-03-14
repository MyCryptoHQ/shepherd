import {
  BalancerNetworkSwitchRequestedAction,
  BalancerFlushAction,
  BalancerNetworkSwitchSucceededAction,
  BALANCER,
  SetOnlineAction,
  BalancerSetProviderCallRetryThresholdAction,
} from './types';
import {
  SetOfflineAction,
  BalancerInitAction,
} from '@src/ducks/providerBalancer/balancerConfig';

export const balancerFlush = (): BalancerFlushAction => ({
  type: BALANCER.FLUSH,
});

export const balancerNetworkSwitchRequested = (
  payload: BalancerNetworkSwitchRequestedAction['payload'],
): BalancerNetworkSwitchRequestedAction => ({
  payload,
  type: BALANCER.NETWORK_SWTICH_REQUESTED,
});

export const balancerNetworkSwitchSucceeded = (
  payload: BalancerNetworkSwitchSucceededAction['payload'],
): BalancerNetworkSwitchSucceededAction => ({
  type: BALANCER.NETWORK_SWITCH_SUCCEEDED,
  payload,
});

export const balancerSetProviderCallRetryThreshold = (
  payload: BalancerSetProviderCallRetryThresholdAction['payload'],
): BalancerSetProviderCallRetryThresholdAction => ({
  type: BALANCER.SET_PROVIDER_CALL_RETRY_THRESHOLD,
  payload,
});

export const balancerInit = (): BalancerInitAction => ({ type: BALANCER.INIT });

export const setOffline = (): SetOfflineAction => ({ type: BALANCER.OFFLINE });

export const setOnline = (): SetOnlineAction => ({ type: BALANCER.ONLINE });
