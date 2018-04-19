import { idGeneratorFactory } from '@src/utils/idGenerator';
import {
  BALANCER,
  IBalancerAuto,
  IBalancerFlush,
  IBalancerInit,
  IBalancerManualFailed,
  IBalancerManualRequested,
  IBalancerManualSucceeded,
  IBalancerNetworkSwitchRequested,
  IBalancerNetworkSwitchSucceeded,
  IBalancerOffline,
  IBalancerOnline,
  IBalancerQueueTimeout,
  IBalancerSetProviderCallRetryThreshold,
} from './types';

export const balancerFlush = (): IBalancerFlush => ({
  type: BALANCER.FLUSH,
});

const networkIdGenerator = idGeneratorFactory();
export const balancerNetworkSwitchRequested = (
  payload: IBalancerNetworkSwitchRequested['payload'],
): IBalancerNetworkSwitchRequested => ({
  payload,
  type: BALANCER.NETWORK_SWTICH_REQUESTED,
  meta: { id: networkIdGenerator() },
});

export const balancerNetworkSwitchSucceeded = (
  payload: IBalancerNetworkSwitchSucceeded['payload'],
  id: number,
): IBalancerNetworkSwitchSucceeded => ({
  type: BALANCER.NETWORK_SWITCH_SUCCEEDED,
  payload,
  meta: { id },
});

export const balancerSetProviderCallRetryThreshold = (
  payload: IBalancerSetProviderCallRetryThreshold['payload'],
): IBalancerSetProviderCallRetryThreshold => ({
  type: BALANCER.SET_PROVIDER_CALL_RETRY_THRESHOLD,
  payload,
});

export const balancerInit = (
  payload: IBalancerInit['payload'],
): IBalancerInit => ({
  type: BALANCER.INIT,
  payload,
  meta: { id: networkIdGenerator() },
});

export const setOffline = (): IBalancerOffline => ({
  type: BALANCER.OFFLINE,
});

export const setOnline = (): IBalancerOnline => ({
  type: BALANCER.ONLINE,
});

export const setAuto = (): IBalancerAuto => ({ type: BALANCER.AUTO });

export const setManualRequested = (
  payload: IBalancerManualRequested['payload'],
): IBalancerManualRequested => ({
  type: BALANCER.MANUAL_REQUESTED,
  payload,
});

export const setManualSucceeded = (
  payload: IBalancerManualSucceeded['payload'],
): IBalancerManualSucceeded => ({
  type: BALANCER.MANUAL_SUCCEEDED,
  payload,
});

export const setManualFailed = (
  payload: IBalancerManualFailed['payload'],
): IBalancerManualFailed => ({
  type: BALANCER.MANUAL_FAILED,
  payload,
});

export const balancerQueueTimeout = (): IBalancerQueueTimeout => ({
  type: BALANCER.QUEUE_TIMEOUT,
});
