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
import { composeWithDevTools } from 'redux-devtools-extension';
import { providerBalancer as providerBalancerSaga } from '../saga';

const sagaMiddleware = createSagaMiddleware();

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
  composeWithDevTools(applyMiddleware(sagaMiddleware)),
);

export const INITIAL_ROOT_STATE = rootReducer(undefined as any, {} as any);

sagaMiddleware.run(providerBalancerSaga);

export { providerBalancerSaga };
