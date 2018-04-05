import { filterMiddlware } from '@src/ducks/middleware';
import { providerBalancer } from '@src/ducks/providerBalancer';
import { providerConfigs } from '@src/ducks/providerConfigs';
import { RootState } from '@src/types';
import {
  applyMiddleware,
  combineReducers,
  createStore,
  Middleware,
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'remote-redux-devtools';
import { providerBalancer as providerBalancerSaga } from '../saga';

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = composeWithDevTools({
  realtime: true,
  port: 8000,
  maxAge: 300,
});

const rootReducer = combineReducers<RootState>({
  providerBalancer,
  providerConfigs,
});

const middleware =
  process.env.NODE_ENV === 'development'
    ? composeEnhancers(
        applyMiddleware(sagaMiddleware, filterMiddlware as Middleware),
      )
    : applyMiddleware(sagaMiddleware, filterMiddlware as Middleware);

const store = createStore<RootState>(rootReducer, middleware);

const INITIAL_ROOT_STATE = rootReducer(undefined as any, {} as any);

sagaMiddleware.run(providerBalancerSaga);

export { providerBalancerSaga, rootReducer, store, INITIAL_ROOT_STATE };
