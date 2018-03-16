import { Reducer } from 'redux';
import {
  BalancerConfigState,
  BalancerAutoAction,
  BalancerAction,
  BALANCER,
} from './types';
import { DefaultNetworkIds } from '@src/types/networks';
import { BalancerManualAction } from '@src/ducks/providerBalancer/balancerConfig';

const INITIAL_STATE: BalancerConfigState = {
  manual: false,
  offline: true,
  network: DefaultNetworkIds.ETH,
  providerCallRetryThreshold: 3,
};

const handleBalancerAuto: Reducer<BalancerConfigState> = (
  state: BalancerConfigState,
  _: BalancerAutoAction,
) => ({
  ...state,
  manual: false,
});

const handleBalancerManual: Reducer<BalancerConfigState> = (
  state: BalancerConfigState,
  { payload }: BalancerManualAction,
) => ({
  ...state,
  manual: payload.providerId,
});

const balancerConfig: Reducer<BalancerConfigState> = (
  state: BalancerConfigState = INITIAL_STATE,
  action: BalancerAction,
): BalancerConfigState => {
  switch (action.type) {
    case BALANCER.INIT:
      return { ...state, ...action.payload };
    case BALANCER.AUTO:
      return handleBalancerAuto(state, action);
    case BALANCER.MANUAL:
      return handleBalancerManual(state, action);
    case BALANCER.OFFLINE:
      return { ...state, offline: true };
    case BALANCER.ONLINE:
      return { ...state, offline: false };
    case BALANCER.NETWORK_SWITCH_SUCCEEDED:
      return { ...state, network: action.payload.network };
    case BALANCER.SET_PROVIDER_CALL_RETRY_THRESHOLD:
      return {
        ...state,
        providerCallRetryThreshold: action.payload.threshold,
      };
    default:
      return state;
  }
};

export default balancerConfig;
