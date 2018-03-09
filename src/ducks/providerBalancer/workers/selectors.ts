import { RootState } from '@src/ducks';
import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';

export const getWorkers = (state: RootState) =>
  getProviderBalancer(state).workers;

export const getWorkerById = (state: RootState, id: string) =>
  getWorkers(state)[id];
