import { providerBalancer } from '@src/ducks/providerBalancer';
import { providerConfigs } from '@src/ducks/providerConfigs';
import { RootState } from '@src/types';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'remote-redux-devtools';
import { providerBalancer as providerBalancerSaga } from '../saga';

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = composeWithDevTools({
  realtime: true,
  port: 8000,
  maxAge: 300,
  actionsBlacklist: ['SUBSCRIBE_TO_ACTION'],
});

const rootReducer = combineReducers<RootState>({
  providerBalancer,
  providerConfigs,
});

const middleware =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? composeEnhancers(applyMiddleware(sagaMiddleware))
    : applyMiddleware(sagaMiddleware);

const store = createStore<RootState>(rootReducer, middleware);

const INITIAL_ROOT_STATE = rootReducer(undefined as any, {} as any);

sagaMiddleware.run(providerBalancerSaga);

export { providerBalancerSaga, rootReducer, store, INITIAL_ROOT_STATE };
