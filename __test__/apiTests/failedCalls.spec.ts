import { getProviderCallById } from '@src/ducks/providerBalancer/providerCalls';
import { getProviderStatsById } from '@src/ducks/providerBalancer/providerStats';
import { createMockProxyHandler, MockProvider } from '@test/mockNode';
import {
  getAPI,
  makeMockProviderConfig,
  MockProviderImplem,
} from '@test/utils';

describe('failed call handling tests', () => {
  it(
    'should handle a failed call via balancer level timeout',
    async () => {
      const { shepherd, redux } = getAPI();
      const failingProvider = makeMockProviderConfig({
        concurrency: 2,
        network: 'ETH',
        requestFailureThreshold: 3,
        timeoutThresholdMs: 3000,
      });

      const node = await shepherd.init({
        customProviders: { MockProvider: MockProviderImplem },

        network: 'ETH',
      });

      shepherd.useProvider(
        'MockProvider',
        'failingProvider',
        failingProvider,
        new MockProvider(),
        createMockProxyHandler({ baseDelay: 0, failureRate: 100 }),
      );
      try {
        await node.getBalance('0x');
      } catch (e) {
        const state = redux.store.getState();
        // check that the number of retries is 3
        expect(getProviderCallById(state, 0).numOfRetries).toEqual(3);
        // check that the provider failed 3 times, goes offline, then goes back online
        // then is set to 0, then call times out on balancer side before it can try again and put a failed call

        expect(
          getProviderStatsById(state, 'failingProvider')!.requestFailures,
        ).toEqual(0); // TODO: write another version of this test that checks for 1, will need to have the polling-rate adjustable so it's
        expect(e.message).toEqual('Call Flushed');
      }

      const workingProvider = makeMockProviderConfig({
        concurrency: 2,
        network: 'ETH',
        requestFailureThreshold: 3,
        timeoutThresholdMs: 3000,
      });

      shepherd.useProvider(
        'MockProvider',
        'workingProvider',
        workingProvider,
        new MockProvider(),
        createMockProxyHandler({ baseDelay: 0, failureRate: 0 }),
      );

      await node.getBalance('0x');
    },
    8000,
  );

  it(
    'should handle a failed call via too many retries',
    async done => {
      const { shepherd, redux } = getAPI();
      const failingProvider = makeMockProviderConfig({
        concurrency: 2,
        network: 'ETH',
        requestFailureThreshold: 4,
        timeoutThresholdMs: 3000,
      });

      const node = await shepherd.init({
        customProviders: { MockProvider: MockProviderImplem },
        providerCallRetryThreshold: 2,
        network: 'ETH',
      });

      shepherd.useProvider(
        'MockProvider',
        'failingProvider',
        failingProvider,
        new MockProvider(),
        createMockProxyHandler({ baseDelay: 0, failureRate: 100 }),
      );
      try {
        await node.getBalance('0x');
      } catch (e) {
        const state = redux.store.getState();
        // check that the number of retries is 3
        expect(getProviderCallById(state, 0).numOfRetries).toEqual(2);
        // check that the provider failed 3 times, goes offline, then goes back online
        // then is set to 0, then call times out on balancer side before it can try again and put a failed call
        expect(
          getProviderStatsById(state, 'failingProvider')!.requestFailures,
        ).toEqual(3); // TODO: write another version of this test that checks for 1, will need to have the polling-rate adjustable so it's
        expect(e.message).toEqual('mock node error');
        done();
      }
    },
    6000,
  );

  it('should handle timeouts on a single provider', async () => {
    const { shepherd, redux: { store } } = getAPI();
    const eth1 = makeMockProviderConfig({
      concurrency: 2,
      network: 'ETH',
      requestFailureThreshold: 4,
      timeoutThresholdMs: 200,
    });

    const node = await shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
      network: 'ETH',
    });

    shepherd.useProvider(
      'MockProvider',
      'eth1',
      eth1,
      new MockProvider(),
      createMockProxyHandler({
        baseDelay: 400,
        failureRate: 0,
        failDelay: 0,
        getCurrentBlockDelay: 1,
      }),
    );
    try {
      await node.getBalance('0x');
    } catch (e) {
      expect(getProviderCallById(store.getState(), 0).providerId).toEqual(
        'eth1',
      );
      expect(getProviderCallById(store.getState(), 0).pending).toEqual(false);
      expect(getProviderCallById(store.getState(), 0).error).toEqual(
        'Request timed out for eth1',
      );
    }
  });
});
