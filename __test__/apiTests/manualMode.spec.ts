import { getNetwork } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { getProviderCallById } from '@src/ducks/providerBalancer/providerCalls';
import { createMockProxyHandler, MockProvider } from '@test/mockNode';
import {
  getAPI,
  makeMockProviderConfig,
  MockProviderImplem,
} from '@test/utils';

describe('manual mode tests', () => {
  // one case to test is to check that all available methods are on the manual mode provider
  it('should fail on switching to an offline provider', done => {
    const { shepherd } = getAPI();

    const eth1 = makeMockProviderConfig({
      concurrency: 2,
      network: 'ETH',
      requestFailureThreshold: 4,
      timeoutThresholdMs: 2000,
      supportedMethods: { estimateGas: false, getTransactionCount: false },
    });
    shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
      network: 'ETH',
    });
    shepherd.useProvider(
      'MockProvider',
      'eth1',
      eth1,
      new MockProvider(),
      createMockProxyHandler({
        baseDelay: 1000,
        failureRate: 0,
        failDelay: 0,
        getCurrentBlockDelay: 1,
        numberOfFailuresBeforeConnection: 3,
      }),
    );

    shepherd.manual('eth1', false).catch(e => {
      expect(e.message).toEqual('eth1 to manually set to is not online');
      done();
    });
  });

  it('should pass switching to an offline provider given an override', async () => {
    const { shepherd } = getAPI();

    const eth1 = makeMockProviderConfig({
      concurrency: 2,
      network: 'ETH',
      requestFailureThreshold: 4,
      timeoutThresholdMs: 2000,
      supportedMethods: { estimateGas: false, getTransactionCount: false },
    });
    shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
      network: 'ETH',
    });
    shepherd.useProvider(
      'MockProvider',
      'eth1',
      eth1,
      new MockProvider(),
      createMockProxyHandler({
        baseDelay: 1000,
        failureRate: 0,
        failDelay: 0,
        getCurrentBlockDelay: 1,
        numberOfFailuresBeforeConnection: 3,
      }),
    );

    const pid = await shepherd.manual('eth1', true);
    expect(pid).toEqual('eth1');
  });

  it('should fail given no added provider config', done => {
    const { shepherd } = getAPI();

    shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
      network: 'ETH',
    });

    shepherd.manual('eth1', false).catch(e => {
      expect(e.message).toEqual('Provider config for eth1 not found');
      done();
    });
  });

  it('should switch to a new network if the manual node is on a different one', async () => {
    const { shepherd } = getAPI();

    const etc1 = makeMockProviderConfig({
      concurrency: 2,
      network: 'ETC',
      requestFailureThreshold: 4,
      timeoutThresholdMs: 2000,
      supportedMethods: { estimateGas: false, getTransactionCount: false },
    });
    shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
      network: 'ETH',
    });
    shepherd.useProvider(
      'MockProvider',
      'etc1',
      etc1,
      new MockProvider(),
      createMockProxyHandler({
        baseDelay: 1000,
        failureRate: 0,
        failDelay: 0,
        getCurrentBlockDelay: 1,
        numberOfFailuresBeforeConnection: 3,
      }),
    );

    const pid = await shepherd.manual('etc1', true);
    expect(pid).toEqual('etc1');
  });

  it('should fail when attempting to switch to a network while manual mode is enabled', async () => {
    const { shepherd } = getAPI();

    const etc1 = makeMockProviderConfig({
      concurrency: 2,
      network: 'ETC',
      requestFailureThreshold: 4,
      timeoutThresholdMs: 2000,
      supportedMethods: { estimateGas: false, getTransactionCount: false },
    });
    shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
      network: 'ETH',
    });
    shepherd.useProvider(
      'MockProvider',
      'etc1',
      etc1,
      new MockProvider(),
      createMockProxyHandler({
        baseDelay: 1000,
        failureRate: 0,
        failDelay: 0,
        getCurrentBlockDelay: 1,
        numberOfFailuresBeforeConnection: 3,
      }),
    );

    const pid = await shepherd.manual('etc1', true);
    expect(pid).toEqual('etc1');

    await shepherd.switchNetworks('ETH').catch(e => {
      expect(e.message).toEqual("Can't switch networks when in manual mode!");
    });

    shepherd.auto();
    await shepherd.switchNetworks('ETH');
  });

  it(
    'should successfully switch to manual mode on the same network',
    async () => {
      const { shepherd, redux: { store } } = getAPI();
      // make all 3 providers form the full subset so calls only get resolved once all 3 are online
      const eth1 = makeMockProviderConfig({
        concurrency: 2,
        network: 'ETH',
        requestFailureThreshold: 4,
        timeoutThresholdMs: 2000,
        supportedMethods: { estimateGas: false, getTransactionCount: false },
      });

      const eth2 = makeMockProviderConfig({
        concurrency: 2,
        network: 'ETH',
        requestFailureThreshold: 4,
        timeoutThresholdMs: 2000,
        supportedMethods: { getTransactionCount: false, sendRawTx: false },
      });

      const eth3 = makeMockProviderConfig({
        concurrency: 2,
        network: 'ETH',
        requestFailureThreshold: 4,
        timeoutThresholdMs: 2000,
        supportedMethods: { sendRawTx: false, estimateGas: false },
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
          baseDelay: 1000,
          failureRate: 0,
          failDelay: 0,
          getCurrentBlockDelay: 1,
        }),
      );

      shepherd.useProvider(
        'MockProvider',
        'eth2',
        eth2,
        new MockProvider(),
        createMockProxyHandler({
          baseDelay: 1000,
          failureRate: 0,
          failDelay: 0,
          getCurrentBlockDelay: 1,
        }),
      );

      shepherd.useProvider(
        'MockProvider',
        'eth3',
        eth3,
        new MockProvider(),
        createMockProxyHandler({
          baseDelay: 1000,
          failureRate: 0,
          failDelay: 0,
          getCurrentBlockDelay: 1,
        }),
      );

      await Promise.all([
        node.getBalance('0x0'),
        node.getBalance('0x1'),
        node.getBalance('0x2'),
        node.getBalance('0x3'),
        node.getBalance('0x4'),
        node.getBalance('0x5'),
      ]);

      let state = store.getState();
      expect(getProviderCallById(state, 0).providerId).toEqual('eth1');
      expect(getProviderCallById(state, 2).providerId).toEqual('eth2');
      expect(getProviderCallById(state, 4).providerId).toEqual('eth3');

      const eth4 = makeMockProviderConfig({
        concurrency: 2,
        network: 'ETH',
        requestFailureThreshold: 4,
        timeoutThresholdMs: 2000,
      });

      shepherd.useProvider(
        'MockProvider',
        'eth4',
        eth4,
        new MockProvider(),
        createMockProxyHandler({
          baseDelay: 1000,
          failureRate: 0,
          failDelay: 0,
          getCurrentBlockDelay: 1,
        }),
      );

      const pid = await shepherd.manual('eth4', true);
      expect(pid).toEqual('eth4');

      await Promise.all([
        node.getBalance('0x6'),
        node.getBalance('0x7'),
        node.getBalance('0x8'),
        node.getBalance('0x9'),
        node.getBalance('0xa'),
        node.getBalance('0xb'),
      ]);

      state = store.getState();
      expect(getProviderCallById(state, 6).providerId).toEqual('eth4');
      expect(getProviderCallById(state, 7).providerId).toEqual('eth4');
      expect(getProviderCallById(state, 8).providerId).toEqual('eth4');
      expect(getProviderCallById(state, 9).providerId).toEqual('eth4');
      expect(getProviderCallById(state, 10).providerId).toEqual('eth4');
      expect(getProviderCallById(state, 11).providerId).toEqual('eth4');

      shepherd.auto();
      await Promise.all([
        node.getBalance('0xc'),
        node.getBalance('0xd'),
        node.getBalance('0xe'),
        node.getBalance('0xf'),
        node.getBalance('0x10'),
        node.getBalance('0x11'),
      ]);

      state = store.getState();

      expect(getProviderCallById(state, 12).providerId).toEqual('eth1');
      expect(getProviderCallById(state, 13).providerId).toEqual('eth2');
      expect(getProviderCallById(state, 14).providerId).toEqual('eth3');
      expect(getProviderCallById(state, 15).providerId).toEqual('eth4');
      expect(getProviderCallById(state, 16).providerId).toEqual('eth1');
      expect(getProviderCallById(state, 17).providerId).toEqual('eth2');
    },
    8500,
  );

  it('should successfully switch networks if the manual provider is on a different network', async () => {
    const { shepherd, redux: { store } } = getAPI();

    const eth = makeMockProviderConfig({
      concurrency: 2,
      network: 'ETH',
      requestFailureThreshold: 4,
      timeoutThresholdMs: 2000,
    });

    const etc = makeMockProviderConfig({
      concurrency: 2,
      network: 'ETC',
      requestFailureThreshold: 4,
      timeoutThresholdMs: 2000,
    });

    shepherd.enableLogging();

    const node = await shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
      network: 'ETH',
    });

    shepherd.useProvider(
      'MockProvider',
      'eth',
      eth,
      new MockProvider(),
      createMockProxyHandler({
        baseDelay: 1000,
        failureRate: 0,
        failDelay: 0,
        getCurrentBlockDelay: 1,
      }),
    );

    shepherd.useProvider(
      'MockProvider',
      'etc',
      etc,
      new MockProvider(),
      createMockProxyHandler({
        baseDelay: 1000,
        failureRate: 0,
        failDelay: 0,
        getCurrentBlockDelay: 1,
      }),
    );
    await node.getBalance('0x');
    let state = store.getState();
    expect(getProviderCallById(state, 0).providerId).toEqual('eth');

    await shepherd.manual('etc', false);

    await node.getBalance('0x');
    state = store.getState();
    expect(getNetwork(state)).toEqual('ETC');
    expect(getProviderCallById(state, 1).providerId).toEqual('etc');

    await shepherd.manual('eth', false);

    await node.getBalance('0x');
    state = store.getState();
    expect(getNetwork(state)).toEqual('ETH');
    expect(getProviderCallById(state, 2).providerId).toEqual('eth');
  });
});
