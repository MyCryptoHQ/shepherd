import {
  BALANCER,
  BalancerAutoAction,
  BalancerFlushAction,
  BalancerInitAction,
  BalancerManualFailedAction,
  BalancerManualRequestedAction,
  BalancerManualSucceededAction,
  BalancerNetworkSwitchRequestedAction,
  BalancerNetworkSwitchSucceededAction,
  BalancerOfflineAction,
  BalancerOnlineAction,
  BalancerQueueTimeoutAction,
  BalancerSetProviderCallRetryThresholdAction,
} from './types';

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

export const balancerInit = (
  payload: BalancerInitAction['payload'],
): BalancerInitAction => ({ type: BALANCER.INIT, payload });

export const setOffline = (): BalancerOfflineAction => ({
  type: BALANCER.OFFLINE,
});

export const setOnline = (): BalancerOnlineAction => ({
  type: BALANCER.ONLINE,
});

export const setAuto = (): BalancerAutoAction => ({ type: BALANCER.AUTO });

export const setManualRequested = (
  payload: BalancerManualRequestedAction['payload'],
): BalancerManualRequestedAction => ({
  type: BALANCER.MANUAL_REQUESTED,
  payload,
});

export const setManualSucceeded = (
  payload: BalancerManualSucceededAction['payload'],
): BalancerManualSucceededAction => ({
  type: BALANCER.MANUAL_SUCCEEDED,
  payload,
});

export const setManualFailed = (
  payload: BalancerManualFailedAction['payload'],
): BalancerManualFailedAction => ({
  type: BALANCER.MANUAL_FAILED,
  payload,
});

export const balancerQueueTimeout = (): BalancerQueueTimeoutAction => ({
  type: BALANCER.QUEUE_TIMEOUT,
});
