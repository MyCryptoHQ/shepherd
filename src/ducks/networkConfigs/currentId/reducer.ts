import {
  CurrentNetworkIdState,
  CurrentNetworkConfigAction,
  NETWORK_CURRENT_CONFIG,
} from './types';
import { DefaultNetworkIds } from '@src/types/networks';

const INITIAL_STATE = DefaultNetworkIds.ETH;

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
