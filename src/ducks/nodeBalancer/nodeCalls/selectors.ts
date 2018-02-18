import { RootState } from '@src/ducks';
import { getNodeBalancer } from '@src/ducks/nodeBalancer/selectors';

export const getNodeCalls = (state: RootState) =>
  getNodeBalancer(state).nodeCalls;

export const getNodeCallById = (state: RootState, id: string) =>
  getNodeCalls(state)[id];
