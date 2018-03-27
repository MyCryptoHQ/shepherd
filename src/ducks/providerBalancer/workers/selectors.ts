import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';
import { RootState } from '@src/types';

export const getWorkers = (state: RootState) =>
  getProviderBalancer(state).workers;

export const getWorkerById = (state: RootState, id: string) =>
  getWorkers(state)[id];
