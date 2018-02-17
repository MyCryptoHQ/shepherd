import {
  BalancerNetworkSwitchRequestedAction,
  BalancerFlushAction,
  NetworkSwitchSucceededAction,
  BALANCER,
} from './types';

export const balancerFlush = (): BalancerFlushAction => ({
  type: BALANCER.FLUSH,
});

export const balancerNetworkSwitchRequested = (): BalancerNetworkSwitchRequestedAction => ({
  type: BALANCER.NETWORK_SWTICH_REQUESTED,
});

export const networkSwitchSucceeded = (
  payload: NetworkSwitchSucceededAction['payload'],
): NetworkSwitchSucceededAction => ({
  type: BALANCER.NETWORK_SWITCH_SUCCEEDED,
  payload,
});
