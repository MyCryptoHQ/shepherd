import {
  providerBalancer,
  ProviderBalancerState,
} from '@src/ducks/providerBalancer';
import {
  providerConfigs,
  ProviderConfigState,
} from '@src/ducks/providerConfigs';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'remote-redux-devtools';

import { providerBalancer as providerBalancerSaga } from '../saga';
process.env.NODE_ENV === 'development';

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = composeWithDevTools({ realtime: true, port: 8000 });

export interface RootState {
  providerBalancer: ProviderBalancerState;
  providerConfigs: ProviderConfigState;
}

export const rootReducer = combineReducers<RootState>({
  providerBalancer,
  providerConfigs,
});

export const store = createStore<RootState>(
  rootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware)),
);

export const INITIAL_ROOT_STATE = rootReducer(undefined as any, {} as any);

sagaMiddleware.run(providerBalancerSaga);

export { providerBalancerSaga };
