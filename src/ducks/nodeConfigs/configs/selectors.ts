import { RootState } from '@src/ducks';
import { getNodes } from '@src/ducks/nodeConfigs/selectors';

export const getNodeConfigs = (state: RootState) => getNodes(state).config;
export const getNodeConfigById = (state: RootState, id: string) =>
  getNodeConfigs(state)[id];
