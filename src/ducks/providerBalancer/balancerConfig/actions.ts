import {
  BalancerNetworkSwitchRequestedAction,
  BalancerFlushAction,
  NetworkSwitchSucceededAction,
  BALANCER,
  SetOnlineAction,
} from './types';
import { SetOfflineAction } from '@src/ducks/providerBalancer/balancerConfig';

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

export const setOffline = (): SetOfflineAction => ({ type: BALANCER.OFFLINE });

export const setOnline = (): SetOnlineAction => ({ type: BALANCER.ONLINE });
