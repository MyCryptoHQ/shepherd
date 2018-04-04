require('isomorphic-fetch');
import { IShepherd } from '@src/types/api';
import { providerBalancerSaga, rootReducer, store } from './ducks';
export { shepherd } from './api';
export const redux = { store, rootReducer, providerBalancerSaga };
type IRedux = typeof redux;

export interface IIndex {
  shepherd: IShepherd;
  redux: IRedux;
}
