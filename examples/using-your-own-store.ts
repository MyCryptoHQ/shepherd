import { createMockProxyHandler, MockProvider } from '@test/mockNode';
import {
  getAPI,
  makeMockProviderConfig,
  MockProviderImplem,
} from '@test/utils';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'remote-redux-devtools';

describe('custom store tests', () => {
  it('should allow the usage of a user supplied store', async () => {
    const { shepherd, redux } = getAPI();
    shepherd.enableLogging();

    const {
      shepherdMiddlware,
      rootReducer: shepherdReducer,
      selectors,
      providerBalancerSaga,
    } = redux;

    const composeEnhancers = composeWithDevTools({
      realtime: true,
      port: 8000,
      maxAge: 300,
    });

    const sagaMiddleware = createSagaMiddleware();

    const rootReducer = combineReducers({ shepherdReducer });
    // make sure to include the shepherdMiddlware last
    const middleware = composeEnhancers(
      applyMiddleware(sagaMiddleware, shepherdMiddlware),
    );
    const store = createStore<any>(rootReducer, middleware);
    sagaMiddleware.run(providerBalancerSaga);

    const node = await shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
      storeRoot: 'shepherdReducer',
      store,
    });

    const providerArgs = [
      new MockProvider(),
      createMockProxyHandler({ baseDelay: 500, failureRate: 0 }),
    ];

    shepherd.useProvider(
      'MockProvider',
      'eth1',
      makeMockProviderConfig({
        concurrency: 4,
        network: 'ETH',
        requestFailureThreshold: 2,
        timeoutThresholdMs: 3000,
      }),
      ...providerArgs,
    );

    const res = await node.getBalance('0x' as any);
    const selectedCall = selectors.providerBalancerSelectors.providerCallsSelectors.getProviderCallById(
      store.getState(),
      0,
    );
    expect(selectedCall.error).toBeFalsy();
    expect(selectedCall.result).toBeTruthy();
    expect(res).toBeTruthy();
  });
});
