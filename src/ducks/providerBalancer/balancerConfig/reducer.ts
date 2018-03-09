import { Reducer } from 'redux';
import {
  BalancerConfigState,
  BalancerAutoAction,
  BalancerAction,
  BALANCER,
} from './types';

const INITIAL_STATE: BalancerConfigState = {
  manual: false,
  offline: true,
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
  _: BalancerAutoAction,
) => ({
  ...state,
  manual: true,
});

const balancerConfig: Reducer<BalancerConfigState> = (
  state: BalancerConfigState = INITIAL_STATE,
  action: BalancerAction,
): BalancerConfigState => {
  switch (action.type) {
    case BALANCER.AUTO:
      return handleBalancerAuto(state, action);
    case BALANCER.MANUAL:
      return handleBalancerManual(state, action);
    case BALANCER.OFFLINE:
      return { ...state, offline: true };
    case BALANCER.ONLINE:
      return { ...state, offline: false };

    default:
      return state;
  }
};

export default balancerConfig;
