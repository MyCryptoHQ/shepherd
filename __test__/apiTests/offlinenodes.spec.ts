import { getProviderStatsById } from '@src/ducks/providerBalancer/providerStats';
import { createMockProxyHandler, MockProvider } from '@test/mockNode';
import {
  asyncTimeout,
  getAPI,
  makeMockProviderConfig,
  MockProviderImplem,
} from '@test/utils';

describe('offline provider tests', () => {
  it(
    'should poll providers that are offline',
    async () => {
      const { shepherd, redux: { store } } = getAPI();
      const failingProvider = makeMockProviderConfig({
        concurrency: 2,
        network: 'ETH',
        requestFailureThreshold: 3,
        timeoutThresholdMs: 3000,
      });

      await shepherd.init({
        customProviders: { MockProvider: MockProviderImplem },

        network: 'ETH',
      });

      shepherd.useProvider(
        'MockProvider',
        'failingProvider',
        failingProvider,
        new MockProvider(),
        createMockProxyHandler({
          baseDelay: 0,
          failureRate: 100,
          numberOfFailuresBeforeConnection: 1,
        }),
      );

      // should take around 5 seconds to be online given polling delay of 5 seconds
      // iniital call -> fail1 -> wait 5 seconds -> fail2 -> wait 5 seconds -> online

      await asyncTimeout(1000);

      expect(
        getProviderStatsById(store.getState(), 'failingProvider')!.isOffline,
      ).toEqual(true);

      await asyncTimeout(2000);

      expect(
        getProviderStatsById(store.getState(), 'failingProvider')!.isOffline,
      ).toEqual(true);

      await asyncTimeout(2100);

      expect(
        getProviderStatsById(store.getState(), 'failingProvider')!.isOffline,
      ).toEqual(false);
    },
    7500,
  );
});
