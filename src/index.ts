require('isomorphic-fetch');
import { store, rootReducer, providerBalancerSaga } from './ducks';
import { IShepherd } from '@src/types/api';

// shepherd.config({callTimeout })
// const myNode = shepherd.init({providers })
// shepherd.add({provider})
// shepherd.remove({provider})
// shepherd.modify({provider: { supportedMethods, maxWorkers } })
// shepherd.only({provider})
// shepherd.delegate([{provider}], [methods] )
// shepherd.switchNetworks(network)

export { default as shepherd } from './api';
export const redux = { store, rootReducer, providerBalancerSaga };
type IRedux = typeof redux;

export interface IIndex {
  shepherd: IShepherd;
  redux: IRedux;
}
