import { NodeBalancerState } from '@src/ducks/nodeBalancer';

export enum BALANCER {
  NETWORK_SWTICH_REQUESTED = 'BALANCER_NETWORK_SWTICH_REQUESTED',
  NETWORK_SWITCH_SUCCEEDED = 'BALANCER_NETWORK_SWITCH_SUCCEEDED',
  FLUSH = 'BALANCER_FLUSH',
  AUTO = 'BALANCER_AUTO',
  MANUAL = 'BALANCER_MANUAL',
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
    nodeStats: NodeBalancerState['nodes'];
    workers: NodeBalancerState['workers'];
  };
}

export interface BalancerAutoAction {
  type: BALANCER.AUTO;
}

export interface BalancerManualAction {
  type: BALANCER.MANUAL;
  payload: { nodeId: string };
}

export type BalancerAction =
  | BalancerFlushAction
  | BalancerAutoAction
  | BalancerManualAction
  | BalancerNetworkSwitchRequestedAction
  | NetworkSwitchSucceededAction;
