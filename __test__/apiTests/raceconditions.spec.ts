import { getProviderCallById } from '@src/ducks/providerBalancer/providerCalls';
import { getProviderStatsById } from '@src/ducks/providerBalancer/providerStats';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { StrIdx } from '@src/types';
import { createMockProxyHandler, MockProvider } from '@test/mockNode';
import {
  getAPI,
  makeMockProviderConfig,
  MockProviderImplem,
} from '@test/utils';

describe('race condition tests', () => {
  it('should initialize and process the call, then switch networks and process the next call', async () => {
    const { shepherd, redux } = getAPI();
    const node = await shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
      network: 'ETH',
    });

    const providerConfigs: StrIdx<IProviderConfig> = {
      eth1: makeMockProviderConfig({
        concurrency: 2,
        network: 'ETH',
        requestFailureThreshold: 3,
        supportedMethods: { getTransactionCount: false },
        timeoutThresholdMs: 3000,
      }),

      eth2: makeMockProviderConfig({
        concurrency: 2,
        network: 'ETH',
        requestFailureThreshold: 2,
        supportedMethods: { getBalance: false },
        timeoutThresholdMs: 3000,
      }),

      etc1: makeMockProviderConfig({
        concurrency: 2,
        network: 'ETC',
        requestFailureThreshold: 3,
        timeoutThresholdMs: 3000,
      }),
    };

    node.getBalance('0x').catch(e => {
      expect(e.message).toEqual('Call Flushed');
    });

    shepherd.useProvider(
      'MockProvider',
      'eth1',
      providerConfigs.eth1,
      new MockProvider(),
      createMockProxyHandler({ baseDelay: 500, failureRate: 0 }),
    );

    shepherd.useProvider(
      'MockProvider',
      'eth2',
      providerConfigs.eth2,
      new MockProvider(),
      createMockProxyHandler({ baseDelay: 500, failureRate: 0 }),
    );

    shepherd.useProvider(
      'MockProvider',
      'etc1',
      providerConfigs.etc1,
      new MockProvider(),
      createMockProxyHandler({ baseDelay: 1000, failureRate: 0 }),
    );

    node.getCurrentBlock().catch(e => {
      expect(e.message).toEqual('Call Flushed');
    });
    await shepherd.switchNetworks('ETC');
    await node.getCurrentBlock();
    node.getCurrentBlock().catch(e => {
      expect(e.message).toEqual('Call Flushed');
    });
    await shepherd.switchNetworks('ETH');
    await node.getCurrentBlock();
    const state = redux.store.getState();

    expect(getProviderCallById(state, 0).providerId).toEqual(undefined);
    expect(getProviderCallById(state, 1).providerId).toEqual(undefined);
    expect(getProviderCallById(state, 2).providerId).toEqual('etc1');
    expect(getProviderCallById(state, 3).providerId).toEqual(undefined);
    expect(getProviderCallById(state, 4).providerId).toEqual('eth1');

    // check that they all got properly flushed / cancelled
    expect(getProviderCallById(state, 0).pending).toEqual(false);
    expect(getProviderCallById(state, 1).pending).toEqual(false);
    expect(getProviderCallById(state, 3).pending).toEqual(false);

    expect(getProviderCallById(state, 0).error).toBeTruthy();
    expect(getProviderCallById(state, 1).error).toBeTruthy();
    expect(getProviderCallById(state, 3).error).toBeTruthy();
  });

  it(
    'should handles failure case of network switch requested  \
        => provider isnt online so watchOfflineProvider fires  \
        => provider is online before network switch is successful \
        =>  watchOfflineProvider puts an action to a non existent provider id',
    async () => {
      const { shepherd, redux: { store } } = getAPI();
      const failingProvider1 = makeMockProviderConfig({
        concurrency: 2,
        network: 'ETH',
        requestFailureThreshold: 3,
        timeoutThresholdMs: 7000,
      });

      const failingProvider2 = makeMockProviderConfig({
        concurrency: 2,
        network: 'ETH',
        requestFailureThreshold: 3,
        timeoutThresholdMs: 1000,
      });

      await shepherd.init({
        customProviders: { MockProvider: MockProviderImplem },
        network: 'ETC',
      });

      shepherd.useProvider(
        'MockProvider',
        'failingProvider1',
        failingProvider1,
        new MockProvider(),
        createMockProxyHandler({
          baseDelay: 6000,
          failureRate: 100,
          numberOfFailuresBeforeConnection: 1,
        }),
      );

      shepherd.useProvider(
        'MockProvider',
        'failingProvider2',
        failingProvider2,
        new MockProvider(),
        createMockProxyHandler({
          baseDelay: 0,
          failureRate: 100,
          numberOfFailuresBeforeConnection: 1,
        }),
      );

      await shepherd.switchNetworks('ETH');

      expect(
        getProviderStatsById(store.getState(), 'failingProvider1')!.isOffline,
      ).toEqual(true);

      expect(
        getProviderStatsById(store.getState(), 'failingProvider2')!.isOffline,
      ).toEqual(false);
    },
    11000,
  );
});
