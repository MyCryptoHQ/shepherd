import { ProviderBalancerState } from '@src/ducks/providerBalancer';
import { Omit } from '@src/types';

export enum BALANCER {
  NETWORK_SWTICH_REQUESTED = 'BALANCER_NETWORK_SWTICH_REQUESTED',
  NETWORK_SWITCH_SUCCEEDED = 'BALANCER_NETWORK_SWITCH_SUCCEEDED',
  SET_PROVIDER_CALL_RETRY_THRESHOLD = 'BALANCER_SET_PROVIDER_CALL_RETRY_THRESHOLD',
  INIT = 'BALANCER_INIT',
  FLUSH = 'BALANCER_FLUSH',
  AUTO = 'BALANCER_AUTO',
  MANUAL = 'BALANCER_MANUAL',
  OFFLINE = 'BALANCER_OFFLINE',
  ONLINE = 'BALANCER_ONLINE',
}

export type BalancerConfigInitConfig = Partial<
  Omit<BalancerConfigState, 'offline'>
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

export interface BalancerManualAction {
  type: BALANCER.MANUAL;
  payload: { providerId: string };
}

export type BalancerAction =
  | BalancerInitAction
  | BalancerOfflineAction
  | BalancerOnlineAction
  | BalancerFlushAction
  | BalancerSetProviderCallRetryThresholdAction
  | BalancerAutoAction
  | BalancerManualAction
  | BalancerNetworkSwitchRequestedAction
  | BalancerNetworkSwitchSucceededAction;
