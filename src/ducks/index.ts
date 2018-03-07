import { networkConfigs, NetworkConfigState } from '@src/ducks/networkConfigs';
import { nodeBalancer, NodeBalancerState } from '@src/ducks/nodeBalancer';
import { nodeConfigs, NodeConfigState } from '@src/ducks/nodeConfigs';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { nodeBalancer as nodeBalancerSaga } from '../saga';

const sagaMiddleware = createSagaMiddleware();

export interface RootState {
  networkConfigs: NetworkConfigState;
  nodeBalancer: NodeBalancerState;
  nodeConfigs: NodeConfigState;
}

export const rootReducer = combineReducers<RootState>({
  networkConfigs,
  nodeBalancer,
  nodeConfigs,
});

export const store = createStore<RootState>(
  rootReducer,
  composeWithDevTools(applyMiddleware(sagaMiddleware)),
);

sagaMiddleware.run(nodeBalancerSaga);
