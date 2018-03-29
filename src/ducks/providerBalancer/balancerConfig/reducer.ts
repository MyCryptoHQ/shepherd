import { DefaultNetworkIds } from '@src/types/networks';
import { Reducer } from 'redux';
import {
  BALANCER,
  BalancerManualAction,
  BalancerSetAmbientSucceededAction,
  BalancerAction,
  BalancerAutoAction,
  BalancerConfigState,
  BalancerUnsetAmbientAction,
} from './types';

const INITIAL_STATE: BalancerConfigState = {
  manual: false,
  offline: true,
  network: DefaultNetworkIds.ETH,
  providerCallRetryThreshold: 3,
  ambientProviderSet: false,
};

const handleBalancerAuto: Reducer<BalancerConfigState> = (
  state,
  _: BalancerAutoAction,
) => ({
  ...state,
  manual: false,
});

const handleBalancerManual: Reducer<BalancerConfigState> = (
  state,
  { payload }: BalancerManualAction,
) => ({
  ...state,
  manual: payload.providerId,
});

const handleBalancerSetAmbient: Reducer<BalancerConfigState> = (
  state,
  _: BalancerSetAmbientSucceededAction,
) => ({ ...state, ambientProviderSet: true });

const handleBalancerUnsetAmbient: Reducer<BalancerConfigState> = (
  state,
  _: BalancerUnsetAmbientAction,
) => ({ ...state, ambientProviderSet: false });

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
    case BALANCER.SET_AMBIENT_SUCCEEDED:
      return handleBalancerSetAmbient(state, action);
    case BALANCER.UNSET_AMBIENT:
      return handleBalancerUnsetAmbient(state, action);
    default:
      return state;
  }
};

export default balancerConfig;
