import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';
import { IRootState } from '@src/types';

export const getWorkers = (state: IRootState) =>
  getProviderBalancer(state).workers;

export const getWorkerById = (state: IRootState, id: string) =>
  getWorkers(state)[id];
