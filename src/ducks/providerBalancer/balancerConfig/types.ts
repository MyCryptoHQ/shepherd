import { ProviderBalancerState } from '@src/ducks/providerBalancer';
import { Omit } from '@src/types';

export enum BALANCER {
  NETWORK_SWTICH_REQUESTED = 'BALANCER_NETWORK_SWTICH_REQUESTED',
  NETWORK_SWITCH_SUCCEEDED = 'BALANCER_NETWORK_SWITCH_SUCCEEDED',
  SET_PROVIDER_CALL_RETRY_THRESHOLD = 'BALANCER_SET_PROVIDER_CALL_RETRY_THRESHOLD',
  INIT = 'BALANCER_INIT',
  FLUSH = 'BALANCER_FLUSH',
  AUTO = 'BALANCER_AUTO',
  MANUAL_REQUESTED = 'BALANCER_MANUAL_REQUESTED',
  MANUAL_SUCCEEDED = 'BALANCER_MANUAL_SUCCEEDED',
  MANUAL_FAILED = 'BALANCER_MANUAL_FAILED',

  OFFLINE = 'BALANCER_OFFLINE',
  ONLINE = 'BALANCER_ONLINE',
  QUEUE_TIMEOUT = 'QUEUE_TIMEOUT',
}

export type BalancerConfigInitConfig = Partial<
  Omit<BalancerConfigState, 'offline' | 'manual'>
>;

export interface BalancerConfigState {
  network: string;
  manual: false | string;
  offline: boolean;
  providerCallRetryThreshold: number;
}

export interface BalancerInitAction {
  type: BALANCER.INIT;
  payload: BalancerConfigInitConfig;
}

export interface BalancerFlushAction {
  type: BALANCER.FLUSH;
}

export interface BalancerQueueTimeoutAction {
  type: BALANCER.QUEUE_TIMEOUT;
}

export interface BalancerNetworkSwitchRequestedAction {
  type: BALANCER.NETWORK_SWTICH_REQUESTED;
  payload: { network: string };
}

export interface BalancerNetworkSwitchSucceededAction {
  type: BALANCER.NETWORK_SWITCH_SUCCEEDED;
  payload: {
    providerStats: ProviderBalancerState['providerStats'];
    workers: ProviderBalancerState['workers'];
    network: string;
  };
}

export interface BalancerSetProviderCallRetryThresholdAction {
  type: BALANCER.SET_PROVIDER_CALL_RETRY_THRESHOLD;
  payload: {
    threshold: number;
  };
}

export interface BalancerOfflineAction {
  type: BALANCER.OFFLINE;
}

export interface BalancerOnlineAction {
  type: BALANCER.ONLINE;
}

export interface BalancerAutoAction {
  type: BALANCER.AUTO;
}

export interface BalancerManualRequestedAction {
  type: BALANCER.MANUAL_REQUESTED;
  payload: { providerId: string; skipOfflineCheck: boolean };
}

export interface BalancerManualSucceededAction {
  type: BALANCER.MANUAL_SUCCEEDED;
  payload: { providerId: string };
}

export interface BalancerManualFailedAction {
  type: BALANCER.MANUAL_FAILED;
  payload: { error: string };
}

export type BalancerAction =
  | BalancerInitAction
  | BalancerOfflineAction
  | BalancerOnlineAction
  | BalancerFlushAction
  | BalancerSetProviderCallRetryThresholdAction
  | BalancerAutoAction
  | BalancerManualRequestedAction
  | BalancerManualSucceededAction
  | BalancerManualFailedAction
  | BalancerNetworkSwitchRequestedAction
  | BalancerNetworkSwitchSucceededAction;
