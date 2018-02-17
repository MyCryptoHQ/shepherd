import { RootState } from '@src/ducks';
import { getNetworkConfigById } from './configs';
import { getCurrentNetworkId } from './currentId';

export const getNetworks = (state: RootState) => state.networkConfigs;
export const getCurrentNetworkConfig = (state: RootState) =>
  getNetworkConfigById(state, getCurrentNetworkId(state));
