import { getProviderCallById } from '@src/ducks/providerBalancer/providerCalls';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { trackTime } from '@src/saga/sagaUtils';
import { IStrIdx } from '@src/types';
import { createMockProxyHandler, MockProvider } from '@test/mockNode';
import { getFinishedCallsByProviderId } from '@test/selectors';
import {
  asyncTimeout,
  getAPI,
  makeMockProviderConfig,
  MockProviderImplem,
} from '@test/utils';

describe('fallover tests', () => {
  it('should handle failed requests and replay them on another provider', async () => {
    const { shepherd, redux } = getAPI();
    const node = await shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
      providerCallRetryThreshold: 3,
      network: 'ETG',
    });

    const providerConfigs: IStrIdx<IProviderConfig> = {
      etg1: makeMockProviderConfig({
        concurrency: 6,
        network: 'ETG',
        requestFailureThreshold: 3,
        timeoutThresholdMs: 3000,
      }),

      etg2: makeMockProviderConfig({
        concurrency: 6,
        network: 'ETG',
        requestFailureThreshold: 3,
        timeoutThresholdMs: 3000,
      }),
    };

    shepherd.useProvider(
      'MockProvider',
      'etg1',
      providerConfigs.etg1,
      new MockProvider(),
      createMockProxyHandler({ baseDelay: 400, failureRate: 100 }),
    );

    shepherd.useProvider(
      'MockProvider',
      'etg2',
      providerConfigs.etg2,
      new MockProvider(),
      createMockProxyHandler({ baseDelay: 1000, failureRate: 0 }),
    );

    const timer = trackTime();

    const promiseArr: any = [];
    for (let i = 0; i < 5; i++) {
      await asyncTimeout(70);
      promiseArr.push(node.getBalance('0x'));
    }

    await Promise.all(promiseArr);
    const state = redux.store.getState();
    const etg1 = getFinishedCallsByProviderId(state, 'etg1');
    const etg2 = getFinishedCallsByProviderId(state, 'etg2');

    const stats = (name: string, num: number) =>
      console.log(`${name} Requests Processed: ${num} | ${num / 200 * 100}%`);
    stats('etg1', etg1);
    stats('etg2', etg2);

    const timeTaken = timer.end();
    console.log(`Time taken ${timeTaken / 1000}s`);

    // Max parallel connections taken from: http://www.stevesouders.com/blog/2008/03/20/roundup-on-parallel-connections/
    console.log(
      `Optimal single provider time ${((200 + 1000) / 2 + 70) * 5 / 1000 / 6}s`,
    );
    expect(etg1).toEqual(0);
    expect(etg2).toEqual(5);
    // increase time from 3000 to 4000 because of travis
    expect(timeTaken).toBeLessThanOrEqual(4000);
  });

  it('should fail a request when it retries too many times', async done => {
    const { shepherd, redux } = getAPI();
    const node = await shepherd.init({
      customProviders: { MockProvider: MockProviderImplem },
      providerCallRetryThreshold: 2,
      network: 'ETG',
    });

    const providerConfigs: IStrIdx<IProviderConfig> = {
      etg1: makeMockProviderConfig({
        concurrency: 6,
        network: 'ETG',
        requestFailureThreshold: 3,
        timeoutThresholdMs: 3000,
      }),
    };

    shepherd.useProvider(
      'MockProvider',
      'etg1',
      providerConfigs.etg1,
      new MockProvider(),
      createMockProxyHandler({ baseDelay: 200, failureRate: 100 }),
    );

    node.getBalance('0x').catch(e => {
      expect(e.message).toEqual('mock node error');
      expect(
        getProviderCallById(redux.store.getState(), 0).numOfRetries,
      ).toEqual(2);
      done();
    });
  });
});
