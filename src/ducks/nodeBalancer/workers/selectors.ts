import { RootState } from '@src/ducks';
import { getNodeBalancer } from '@src/ducks/nodeBalancer/selectors';

export const getWorkers = (state: RootState) => getNodeBalancer(state).workers;

export const getWorkerById = (state: RootState, id: string) =>
  getWorkers(state)[id];
