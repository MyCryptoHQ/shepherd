import { getRootState } from '@src/ducks/rootState';
import { RootState } from '@src/types';

export const getProviderBalancer = (state: RootState) =>
  getRootState(state).providerBalancer;
