import { RootState } from '@src/ducks';
import { getNetworkConfigById } from './configs';
import { getCurrentNetworkId } from './currentId';

export const getNetworks = (state: RootState) => {
  console.log(state);
  const networks = state.networkConfigs;
  console.log(networks);
  return networks;
};

export const getCurrentNetworkConfig = (state: RootState) =>
  getNetworkConfigById(state, getCurrentNetworkId(state));
