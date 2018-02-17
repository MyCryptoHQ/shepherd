import {
  CurrentNetworkIdState,
  CurrentNetworkConfigAction,
  NETWORK_CURRENT_CONFIG,
} from './types';

const currentConfigReducer = (
  state: CurrentNetworkIdState,
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
