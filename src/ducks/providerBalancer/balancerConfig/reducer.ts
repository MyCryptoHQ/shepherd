import { IBalancerManualSucceeded } from '@src/ducks/providerBalancer/balancerConfig';
import { Reducer } from 'redux';
import {
  BALANCER,
  BalancerAction,
  IBalancerAuto,
  IBalancerConfigState,
} from './types';

const INITIAL_STATE: IBalancerConfigState = {
  manual: false,
  offline: true,
  network: 'ETH',
  providerCallRetryThreshold: 3,
};

const handleBalancerAuto: Reducer<IBalancerConfigState> = (
  state: IBalancerConfigState,
  _: IBalancerAuto,
) => ({
  ...state,
  manual: false,
});

const handleBalancerManual: Reducer<IBalancerConfigState> = (
  state: IBalancerConfigState,
  { payload }: IBalancerManualSucceeded,
) => ({
  ...state,
  manual: payload.providerId,
});

export const balancerConfigReducer: Reducer<IBalancerConfigState> = (
  state: IBalancerConfigState = INITIAL_STATE,
  action: BalancerAction,
): IBalancerConfigState => {
  switch (action.type) {
    case BALANCER.INIT:
      return { ...state, ...action.payload };
    case BALANCER.AUTO:
      return handleBalancerAuto(state, action);
    case BALANCER.MANUAL_SUCCEEDED:
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
