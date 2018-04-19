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
});
