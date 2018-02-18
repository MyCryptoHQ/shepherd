import {
  CurrentNetworkIdState,
  CurrentNetworkConfigAction,
  NETWORK_CURRENT_CONFIG,
} from './types';
import { StaticNetworkIds } from '@src/types/networks';

const INITIAL_STATE = StaticNetworkIds.ETH;

const currentConfigReducer = (
  state: CurrentNetworkIdState = INITIAL_STATE,
  action: CurrentNetworkConfigAction,
) => {
  switch (action.type) {
    case NETWORK_CURRENT_CONFIG.CHANGE:
      return action.payload.id;

    default:
      return state;
  }
};

export default currentConfigReducer;
