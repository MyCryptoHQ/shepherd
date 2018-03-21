import { StrIdx, IProviderContructor } from '@src/types';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { makeMockProviderConfig } from '@test/utils';
import { createMockProxyHandler, MockProvider } from '@test/mockNode';
import { promisify } from 'util';
import { setTimeout } from 'timers';
import { getFinishedCallsByProviderId } from '@test/selectors';
import { IIndex } from './index';
import { trackTime } from '@src/saga/sagaUtils';
import { getProviderCallById } from '@src/ducks/providerBalancer/providerCalls';

const getAPI = () => {
  jest.resetModules();
  const API: IIndex = require('./index');
  return API;
};

const MockProviderImplem = (Proxy as any) as IProviderContructor;

describe('Api tests', () => {
  const asyncTimeout = promisify(setTimeout);

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
    it.skip('should handle manual mode', async () => {
      const { shepherd } = getAPI();
      const node = await shepherd.init({
        customProviders: { MockProvider: MockProviderImplem },
      });
    });
  });

  describe('balancing tests', () => {
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
          console.log(
            `${name} Requests Processed: ${num} | ${num / 200 * 100}%`,
          );
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
        expect(timeTaken).toBeLessThanOrEqual(15600);
      },
      20000,
    );
    it(
      'should handle failed requests and replay them on another provider',
      async () => {
        const { shepherd, redux } = getAPI();
        const node = await shepherd.init({
          customProviders: { MockProvider: MockProviderImplem },
          providerCallRetryThreshold: 3,
          network: 'ETG',
        });

        const providerConfigs: StrIdx<IProviderConfig> = {
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
          console.log(
            `${name} Requests Processed: ${num} | ${num / 200 * 100}%`,
          );
        stats('etg1', etg1);
        stats('etg2', etg2);

        const timeTaken = timer.end();
        console.log(`Time taken ${timeTaken / 1000}s`);

        // Max parallel connections taken from: http://www.stevesouders.com/blog/2008/03/20/roundup-on-parallel-connections/
        console.log(
          `Optimal single provider time ${((200 + 1000) / 2 + 70) *
            5 /
            1000 /
            6}s`,
        );
        expect(etg1).toEqual(0);
        expect(etg2).toEqual(5);
        expect(timeTaken).toBeLessThanOrEqual(3000);
      },
      3000,
    );

    it('should fail a request when it retries too many times', async done => {
      const { shepherd, redux } = getAPI();
      const node = await shepherd.init({
        customProviders: { MockProvider: MockProviderImplem },
        providerCallRetryThreshold: 2,
        network: 'ETG',
      });

      const providerConfigs: StrIdx<IProviderConfig> = {
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
        console.error(e);
        expect(
          getProviderCallById(redux.store.getState(), 0).numOfRetries,
        ).toEqual(2);
        done();
      });
    });

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

      node.getBalance('0x');

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

      node.getCurrentBlock();
      await shepherd.switchNetworks('ETC');
      await node.getCurrentBlock();
      node.getCurrentBlock();
      await shepherd.switchNetworks('ETH');
      await node.getCurrentBlock();
      const state = redux.store.getState();

      expect(getProviderCallById(state, 0).providerId).toEqual(undefined);
      expect(getProviderCallById(state, 1).providerId).toEqual(undefined);
      expect(getProviderCallById(state, 2).providerId).toEqual('etc1');
      expect(getProviderCallById(state, 3).providerId).toEqual('etc1');
      expect(getProviderCallById(state, 4).providerId).toEqual('eth1');
    });
  });
});
