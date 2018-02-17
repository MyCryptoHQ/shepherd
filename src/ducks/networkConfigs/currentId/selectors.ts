import { RootState } from '@src/ducks';
import { getNetworks } from '../';

export const getCurrentNetworkId = (state: RootState) =>
  getNetworks(state).currentId;
