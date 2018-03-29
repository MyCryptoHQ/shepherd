import {
  BALANCER,
  BalancerAutoAction,
  BalancerFlushAction,
  BalancerInitAction,
  BalancerManualAction,
  BalancerNetworkSwitchRequestedAction,
  BalancerNetworkSwitchSucceededAction,
  BalancerOfflineAction,
  BalancerOnlineAction,
  BalancerQueueTimeoutAction,
  BalancerSetProviderCallRetryThresholdAction,
  BalancerUnsetAmbientAction,
  BalancerSetAmbientRequestedAction,
  BalancerSetAmbientSucceededAction,
  BalancerSetAmbientFailedAction,
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
  payload: BalancerInitAction['payload'] = {},
): BalancerInitAction => ({ type: BALANCER.INIT, payload });

export const setOffline = (): BalancerOfflineAction => ({
  type: BALANCER.OFFLINE,
});

export const setOnline = (): BalancerOnlineAction => ({
  type: BALANCER.ONLINE,
});

export const setAuto = (): BalancerAutoAction => ({ type: BALANCER.AUTO });

export const setManual = (
  payload: BalancerManualAction['payload'],
): BalancerManualAction => ({ type: BALANCER.MANUAL, payload });

export const balancerQueueTimeout = (): BalancerQueueTimeoutAction => ({
  type: BALANCER.QUEUE_TIMEOUT,
});

export const balancerSetAmbientRequestedProvider = (): BalancerSetAmbientRequestedAction => ({
  type: BALANCER.SET_AMBIENT_REQUESTED,
});
export const balancerSetAmbientSucceededProvider = (): BalancerSetAmbientSucceededAction => ({
  type: BALANCER.SET_AMBIENT_SUCCEEDED,
});
export const balancerSetAmbientFailedProvider = (): BalancerSetAmbientFailedAction => ({
  type: BALANCER.SET_AMBIENT_FAILED,
});

export const balancerUnsetAmbientProvider = (): BalancerUnsetAmbientAction => ({
  type: BALANCER.UNSET_AMBIENT,
});
