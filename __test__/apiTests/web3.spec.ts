import { getProviderCallById } from '@src/ducks/providerBalancer/providerCalls';
import { createMockProxyHandler, MockProvider } from '@test/mockNode';
import {
  getAPI,
  makeMockProviderConfig,
  MockProviderImplem,
} from '@test/utils';

describe('web3 tests', () => {
  it('should instantly fail a web3 sendTransaction and signMessage if it fails', async () => {
    const { shepherd, redux } = getAPI();
    const node = await shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
    });

    const providerArgs = [
      new MockProvider(),
      createMockProxyHandler({ baseDelay: 500, failureRate: 100 }),
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

    /* tslint:disable */
    await node.sendTransaction({} as any).catch(() => {});
    await node.signMessage({} as any, '').catch(() => {});
    /* tslint:enable */
    const signTxCall = getProviderCallById(redux.store.getState(), 0);

    expect(signTxCall.pending).toEqual(false);
    expect(signTxCall.error).toBeTruthy();
    expect(signTxCall.numOfRetries).toEqual(0);

    const signMsgCall = getProviderCallById(redux.store.getState(), 1);

    expect(signMsgCall.pending).toEqual(false);
    expect(signMsgCall.error).toBeTruthy();
    expect(signMsgCall.numOfRetries).toEqual(0);
  });

  it.only(
    'should wait for longer than configured timeout for web3 methods (5 minutes) to allow for user interaction (like metamask tx confirmation)',
    async () => {
      const { shepherd, redux } = getAPI();
      const node = await shepherd.init({
        customProviders: { MockProvider: MockProviderImplem },
        providerCallRetryThreshold: 1,
      });

      const providerArgs = [
        new MockProvider(),
        createMockProxyHandler({
          baseDelay: 3000,
          failureRate: 0,
          getCurrentBlockDelay: 500,
        }),
      ];

      shepherd.useProvider(
        'MockProvider',
        'eth1',
        makeMockProviderConfig({
          concurrency: 4,
          network: 'ETH',
          requestFailureThreshold: 2,
          timeoutThresholdMs: 1000,
        }),
        ...providerArgs,
      );

      await Promise.all([
        node.sendTransaction({} as any),
        node.signMessage({} as any, ''),
      ]);

      const signTxCall = getProviderCallById(redux.store.getState(), 0);

      expect(signTxCall.pending).toEqual(false);
      expect(signTxCall.error).toBeFalsy();
      console.log(signTxCall);
      expect(signTxCall.numOfRetries).toEqual(0);

      const signMsgCall = getProviderCallById(redux.store.getState(), 1);

      expect(signMsgCall.pending).toEqual(false);
      expect(signMsgCall.error).toBeFalsy();
      expect(signMsgCall.numOfRetries).toEqual(0);

      try {
        await node.getBalance('0x' as any);
      } catch {
        const getBalanceCall = getProviderCallById(redux.store.getState(), 2);

        expect(getBalanceCall.pending).toEqual(false);
        expect(getBalanceCall.error).toBeTruthy();
        expect(getBalanceCall.numOfRetries).toEqual(1);
      }
    },
    70000,
  );
});
