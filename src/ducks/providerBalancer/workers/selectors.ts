import { RootState } from '@src/types';
import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';

export const getWorkers = (state: RootState) =>
  getProviderBalancer(state).workers;

export const getWorkerById = (state: RootState, id: string) =>
  getWorkers(state)[id];
