import {
  providerBalancer,
  ProviderBalancerState,
} from '@src/ducks/providerBalancer';
import {
  providerConfigs,
  ProviderConfigState,
} from '@src/ducks/providerConfigs';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'remote-redux-devtools';
import { providerBalancer as providerBalancerSaga } from '../saga';

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

const middleware =
  process.env.NODE_ENV === 'development'
    ? composeEnhancers(applyMiddleware(sagaMiddleware))
    : applyMiddleware(sagaMiddleware);

export const store = createStore<RootState>(rootReducer, middleware);

export const INITIAL_ROOT_STATE = rootReducer(undefined as any, {} as any);

sagaMiddleware.run(providerBalancerSaga);

export { providerBalancerSaga };
