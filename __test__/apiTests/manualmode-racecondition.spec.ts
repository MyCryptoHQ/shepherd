import { createMockProxyHandler, MockProvider } from '@test/mockNode';
import {
  asyncTimeout,
  getAPI,
  makeMockProviderConfig,
  MockProviderImplem,
} from '@test/utils';

it(
  'RACE-CONDITION should handle a manual provider timing out',
  async () => {
    const { shepherd } = getAPI();
    shepherd.enableLogging();
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
      requestFailureThreshold: 2,
      timeoutThresholdMs: 5000,
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
        baseDelay: 2000,
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
        baseDelay: 2000,
        failureRate: 60,
        failDelay: 400,
        getCurrentBlockDelay: 300,
      }),
    );

    await shepherd.manual('eth3', true);

    /* tslint:disable */
    Promise.all([
      node.getBalance('0x0'),
      node.getBalance('0x1'),
      node.getBalance('0x2'),
      node.getBalance('0x3'),
      node.getBalance('0x4'),
      node.getBalance('0x5'),
    ]).catch(() => {});

    Promise.all([
      node.getBalance('0x0'),
      node.getBalance('0x1'),
      node.getBalance('0x2'),
      node.getBalance('0x3'),
      node.getBalance('0x4'),
      node.getBalance('0x5'),
    ]).catch(() => {});

    try {
      await Promise.all([
        node.getBalance('0x0'),
        node.getBalance('0x1'),
        node.getBalance('0x2'),
        node.getBalance('0x3'),
        node.getBalance('0x4'),
        node.getBalance('0x5'),
      ]);
    } catch {}
    /* tslint:enable */
    await asyncTimeout(5000);
  },
  17000,
);
