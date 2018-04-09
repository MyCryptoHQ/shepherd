import { IProviderConfig } from '@src/ducks/providerConfigs';
import { trackTime } from '@src/saga/sagaUtils';
import { StrIdx } from '@src/types';
import { createMockProxyHandler, MockProvider } from '@test/mockNode';
import { getFinishedCallsByProviderId } from '@test/selectors';
import {
  asyncTimeout,
  getAPI,
  makeMockProviderConfig,
  MockProviderImplem,
} from '@test/utils';

describe('provider balancing tests', () => {
  it(
    'should balance between providers evenly',
    async () => {
      const { shepherd, redux } = getAPI();
      const node = await shepherd.init({
        customProviders: { MockProvider: MockProviderImplem },
        network: 'ETG',
      });

      const providerConfigs: StrIdx<IProviderConfig> = {
        etg1: makeMockProviderConfig({
          concurrency: 6,
          network: 'ETG',
          requestFailureThreshold: 3,
          supportedMethods: { getTransactionCount: false },
          timeoutThresholdMs: 3000,
        }),

        etg2: makeMockProviderConfig({
          concurrency: 6,
          network: 'ETG',
          requestFailureThreshold: 2,
          supportedMethods: { getBalance: false },
          timeoutThresholdMs: 3000,
        }),

        etg3: makeMockProviderConfig({
          concurrency: 6,
          network: 'ETG',
          requestFailureThreshold: 3,
          timeoutThresholdMs: 3000,
        }),

        etg4: makeMockProviderConfig({
          concurrency: 6,
          network: 'ETG',
          requestFailureThreshold: 3,
          supportedMethods: { getTransactionCount: false },
          timeoutThresholdMs: 3000,
        }),
      };

      shepherd.useProvider(
        'MockProvider',
        'etg1',
        providerConfigs.etg1,
        new MockProvider(),
        createMockProxyHandler({ baseDelay: 200, failureRate: 0 }),
      );

      shepherd.useProvider(
        'MockProvider',
        'etg2',
        providerConfigs.etg2,
        new MockProvider(),
        createMockProxyHandler({ baseDelay: 1000, failureRate: 0 }),
      );

      shepherd.useProvider(
        'MockProvider',
        'etg3',
        providerConfigs.etg3,
        new MockProvider(),
        createMockProxyHandler({ baseDelay: 400, failureRate: 0 }),
      );

      shepherd.useProvider(
        'MockProvider',
        'etg4',
        providerConfigs.etg4,
        new MockProvider(),
        createMockProxyHandler({ baseDelay: 600, failureRate: 0 }),
      );

      const timer = trackTime();

      const promiseArr: any = [];
      for (let i = 0; i < 200; i++) {
        await asyncTimeout(70);
        promiseArr.push(node.getBalance('0x'));
      }

      await Promise.all(promiseArr);

      const state = redux.store.getState();
      const etg1 = getFinishedCallsByProviderId(state, 'etg1');
      const etg2 = getFinishedCallsByProviderId(state, 'etg2');
      const etg3 = getFinishedCallsByProviderId(state, 'etg3');
      const etg4 = getFinishedCallsByProviderId(state, 'etg4');

      const stats = (name: string, num: number) =>
        console.log(`${name} Requests Processed: ${num} | ${num / 200 * 100}%`);
      stats('etg1', etg1);
      stats('etg2', etg2);
      stats('etg3', etg3);
      stats('etg4', etg4);
      const timeTaken = timer.end();
      console.log(`Time taken ${timeTaken / 1000}s`);

      // Max parallel connections taken from: http://www.stevesouders.com/blog/2008/03/20/roundup-on-parallel-connections/
      console.log(
        `Optimal single provider time ${((400 + 600 + 200) / 3 + 70) *
          200 /
          1000 /
          6}s`,
      );

      expect(etg2).toEqual(0);
      expect(etg1).toBeGreaterThan(etg3);
      expect(etg3).toBeGreaterThan(etg4);

      // increased this time from 15600 to 2000 due to travis being slower than testing env
      expect(timeTaken).toBeLessThanOrEqual(20000);
    },
    20000,
  );
});
