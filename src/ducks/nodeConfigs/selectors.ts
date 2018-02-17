import { RootState } from '@src/ducks';
import { getNodeConfigById } from '@src/ducks/nodeConfigs/configs';
import { getCurrentNodeId } from '@src/ducks/nodeConfigs/currentId';

export const getNodes = (state: RootState) => state.nodeConfigs;

export const getCurrentNodeConfig = (state: RootState) =>
  getNodeConfigById(state, getCurrentNodeId(state));
