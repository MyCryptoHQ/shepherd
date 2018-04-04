import { IProviderBalancerState } from '@src/ducks/providerBalancer';
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
  Omit<IBalancerConfigState, 'offline' | 'manual'>
>;

export interface IBalancerConfigState {
  network: string;
  manual: false | string;
  offline: boolean;
  providerCallRetryThreshold: number;
}

export interface IBalancerInit {
  type: BALANCER.INIT;
  payload: BalancerConfigInitConfig;
}

export interface IBalancerFlush {
  type: BALANCER.FLUSH;
}

export interface IBalancerQueueTimeout {
  type: BALANCER.QUEUE_TIMEOUT;
}

export interface IBalancerNetworkSwitchRequested {
  type: BALANCER.NETWORK_SWTICH_REQUESTED;
  payload: { network: string };
}

export interface IBalancerNetworkSwitchSucceeded {
  type: BALANCER.NETWORK_SWITCH_SUCCEEDED;
  payload: {
    providerStats: IProviderBalancerState['providerStats'];
    workers: IProviderBalancerState['workers'];
    network: string;
  };
}

export interface IBalancerSetProviderCallRetryThreshold {
  type: BALANCER.SET_PROVIDER_CALL_RETRY_THRESHOLD;
  payload: {
    threshold: number;
  };
}

export interface IBalancerOffline {
  type: BALANCER.OFFLINE;
}

export interface IBalancerOnline {
  type: BALANCER.ONLINE;
}

export interface IBalancerAuto {
  type: BALANCER.AUTO;
}

export interface IBalancerManualRequested {
  type: BALANCER.MANUAL_REQUESTED;
  payload: { providerId: string; skipOfflineCheck: boolean };
}

export interface IBalancerManualSucceeded {
  type: BALANCER.MANUAL_SUCCEEDED;
  payload: { providerId: string };
}

export interface IBalancerManualFailed {
  type: BALANCER.MANUAL_FAILED;
  payload: { error: string };
}

export type BalancerAction =
  | IBalancerInit
  | IBalancerOffline
  | IBalancerOnline
  | IBalancerFlush
  | IBalancerSetProviderCallRetryThreshold
  | IBalancerAuto
  | IBalancerManualRequested
  | IBalancerManualSucceeded
  | IBalancerManualFailed
  | IBalancerNetworkSwitchRequested
  | IBalancerNetworkSwitchSucceeded;
