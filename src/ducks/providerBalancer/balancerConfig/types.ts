import { ProviderBalancerState } from '@src/ducks/providerBalancer';

export enum BALANCER {
  NETWORK_SWTICH_REQUESTED = 'BALANCER_NETWORK_SWTICH_REQUESTED',
  NETWORK_SWITCH_SUCCEEDED = 'BALANCER_NETWORK_SWITCH_SUCCEEDED',
  FLUSH = 'BALANCER_FLUSH',
  AUTO = 'BALANCER_AUTO',
  MANUAL = 'BALANCER_MANUAL',
  OFFLINE = 'BALANCER_OFFLINE',
  ONLINE = 'BALANCER_ONLINE',
}

export interface BalancerConfigState {
  manual: boolean;
  offline: boolean;
}

export interface BalancerFlushAction {
  type: BALANCER.FLUSH;
}

export interface BalancerNetworkSwitchRequestedAction {
  type: BALANCER.NETWORK_SWTICH_REQUESTED;
}

export interface NetworkSwitchSucceededAction {
  type: BALANCER.NETWORK_SWITCH_SUCCEEDED;
  payload: {
    providerStats: ProviderBalancerState['providerStats'];
    workers: ProviderBalancerState['workers'];
  };
}

export interface SetOfflineAction {
  type: BALANCER.OFFLINE;
}

export interface SetOnlineAction {
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
  | SetOfflineAction
  | SetOnlineAction
  | BalancerFlushAction
  | BalancerAutoAction
  | BalancerManualAction
  | BalancerNetworkSwitchRequestedAction
  | NetworkSwitchSucceededAction;
