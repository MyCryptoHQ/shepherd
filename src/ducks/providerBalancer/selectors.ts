import { getRootState } from '@src/ducks/rootState';
import { IRootState } from '@src/types';

export const getProviderBalancer = (state: IRootState) =>
  getRootState(state).providerBalancer;
