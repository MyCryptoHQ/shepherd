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
    isCustom: false,
  },

  [DefaultNetworkIds.Ropsten]: {
    name: DefaultNetworkIds.Ropsten,
    chainId: 3,
    isCustom: false,
  },
  [DefaultNetworkIds.Kovan]: {
    name: DefaultNetworkIds.Kovan,
    chainId: 42,
    isCustom: false,
  },
  [DefaultNetworkIds.Rinkeby]: {
    name: DefaultNetworkIds.Rinkeby,
    chainId: 4,
    isCustom: false,
  },
  [DefaultNetworkIds.ETC]: {
    name: DefaultNetworkIds.ETC,
    chainId: 61,
    isCustom: false,
  },
  [DefaultNetworkIds.UBQ]: {
    name: DefaultNetworkIds.UBQ,
    chainId: 8,
    isCustom: false,
  },
  [DefaultNetworkIds.EXP]: {
    name: DefaultNetworkIds.EXP,
    chainId: 2,
    isCustom: false,
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
