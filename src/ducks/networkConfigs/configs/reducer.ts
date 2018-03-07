import {
  NetworkConfigState,
  NetworkConfigAction,
  NETWORK_CONFIG,
} from './types';
import { DefaultNetworkIds } from '@src/types/networks';

const INITIAL_STATE: NetworkConfigState = {
  [DefaultNetworkIds.ETH]: {
    name: DefaultNetworkIds.ETH,
    chainId: 1,
  },

  [DefaultNetworkIds.Ropsten]: {
    name: DefaultNetworkIds.Ropsten,
    chainId: 3,
  },
  [DefaultNetworkIds.Kovan]: {
    name: DefaultNetworkIds.Kovan,
    chainId: 42,
  },
  [DefaultNetworkIds.Rinkeby]: {
    name: DefaultNetworkIds.Rinkeby,
    chainId: 4,
  },
  [DefaultNetworkIds.ETC]: {
    name: DefaultNetworkIds.ETC,
    chainId: 61,
  },
  [DefaultNetworkIds.UBQ]: {
    name: DefaultNetworkIds.UBQ,
    chainId: 8,
  },
  [DefaultNetworkIds.EXP]: {
    name: DefaultNetworkIds.EXP,
    chainId: 2,
  },
};

const networkConfigReducer = (
  state: NetworkConfigState = INITIAL_STATE,
  action: NetworkConfigAction,
) => {
  switch (action.type) {
    case NETWORK_CONFIG.ADD:
      return { ...state, [action.payload.id]: action.payload.config };

    case NETWORK_CONFIG.REMOVE:
      const stateCopy = { ...state };
      Reflect.deleteProperty(stateCopy, action.payload.id);
      return stateCopy;

    default:
      return state;
  }
};

export default networkConfigReducer;
