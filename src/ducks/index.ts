import { networkConfigs, NetworkConfigState } from '@src/ducks/networkConfigs';
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
  networkConfigs: NetworkConfigState;
  providerBalancer: ProviderBalancerState;
  providerConfigs: ProviderConfigState;
}

export const rootReducer = combineReducers<RootState>({
  networkConfigs,
  providerBalancer,
  providerConfigs,
});

export const store = createStore<RootState>(
  rootReducer,
  composeWithDevTools(applyMiddleware(sagaMiddleware)),
);

sagaMiddleware.run(providerBalancerSaga);
