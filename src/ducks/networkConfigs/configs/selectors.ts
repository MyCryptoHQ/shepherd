import { RootState } from '@src/ducks';
import { getNetworks } from '@src/ducks/networkConfigs/selectors';

export const getNetworkConfigs = (state: RootState) => {
  const config = getNetworks(state).config;
  return config;
};
export const getNetworkConfigById = (state: RootState, id: string) =>
  getNetworkConfigs(state)[id];
