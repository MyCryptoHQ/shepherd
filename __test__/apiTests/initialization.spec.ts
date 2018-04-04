import { createMockProxyHandler, MockProvider } from '@test/mockNode';
import {
  getAPI,
  makeMockProviderConfig,
  MockProviderImplem,
} from '@test/utils';

describe('initialization tests', () => {
  it('should allow the usage of a custom provider implementation', async () => {
    const { shepherd } = getAPI();
    const node = await shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
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

    const res = node.getBalance('0x');
    expect(res).toBeTruthy();
  });

  it('should allow the usage of a custom provider implementation via addprovider', async () => {
    const { shepherd } = getAPI();

    const node = await shepherd.init({});

    shepherd.addProvider('MockProvider', MockProviderImplem);

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

    const res = node.getBalance('0x');
    expect(res).toBeTruthy();
  });

  it('should allow a different network on switch, returning a promise when initialization is done so calls immediately after initialization dont get dropped', async done => {
    const { shepherd } = getAPI();
    const node = await shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
      network: 'ETC',
    });

    node.getBalance('0x');

    const providerArgs = [
      new MockProvider(),
      createMockProxyHandler({ baseDelay: 500, failureRate: 0 }),
    ];

    shepherd.useProvider(
      'MockProvider',
      'etc1',
      makeMockProviderConfig({
        concurrency: 4,
        network: 'ETC',
        requestFailureThreshold: 2,
        timeoutThresholdMs: 3000,
      }),
      ...providerArgs,
    );

    const res = await node.getBalance('0x');
    expect(res).toBeTruthy();
    done();
  });
});
