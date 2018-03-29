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
  QUEUE_TIMEOUT = 'QUEUE_TIMEOUT',
  SET_AMBIENT_REQUESTED = 'BALANCER_SET_AMBIENT_PROVIDER_REQUESTED',
  SET_AMBIENT_SUCCEEDED = 'BALANCER_SET_AMBIENT_PROVIDER_SUCEEDED',
  SET_AMBIENT_FAILED = 'BALANCER_SET_AMBIENT_PROVIDER_FAILED',
  UNSET_AMBIENT = 'BALANCER_UNSET_AMBIENT_PROVIDER',
}

// clean this up
export type BalancerConfigInitConfig = Partial<
  Omit<BalancerConfigState, 'offline'> & { ambientProviderSet: boolean }
>;

export interface BalancerConfigState {
  network: string;
  manual: false | string;
  offline: boolean;
  providerCallRetryThreshold: number;
  ambientProviderSet: boolean;
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

export interface BalancerManualAction {
  type: BALANCER.MANUAL;
  payload: { providerId: string };
}

// need to expose getAccounts() method on rpc providers
// on request -> check for ambient provider
// fail if it doesnt exist with proper error msg
// if provider exists
// flush current requests
// if network is different
// change network
// re-route all sendtx calls to ambient provider
export interface BalancerSetAmbientRequestedAction {
  type: BALANCER.SET_AMBIENT_REQUESTED;
}

export interface BalancerSetAmbientSucceededAction {
  type: BALANCER.SET_AMBIENT_SUCCEEDED;
}

// fail when no provider found
// or trying to set ambient provider twice
export interface BalancerSetAmbientFailedAction {
  type: BALANCER.SET_AMBIENT_FAILED;
}

// un-reroute sendtx calls
// cancel any tasks fired by setambient
// remove ambient config
// remove ambient instance
export interface BalancerUnsetAmbientAction {
  type: BALANCER.UNSET_AMBIENT;
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
  | BalancerNetworkSwitchSucceededAction
  | BalancerSetAmbientRequestedAction
  | BalancerSetAmbientSucceededAction
  | BalancerSetAmbientFailedAction
  | BalancerUnsetAmbientAction;
