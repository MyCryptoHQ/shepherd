import { RootState } from '@src/ducks';
import { getNetworkConfigById } from './configs';
import { getCurrentNetworkId } from './currentId';

export const getNetworks = (state: RootState) => {
  const networks = state.networkConfigs;
  return networks;
};

export const getCurrentNetworkConfig = (state: RootState) =>
  getNetworkConfigById(state, getCurrentNetworkId(state));
