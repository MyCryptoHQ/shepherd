import { getNetwork } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { getProviderCallById } from '@src/ducks/providerBalancer/providerCalls';
import { getProviderStatsById } from '@src/ducks/providerBalancer/providerStats';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { trackTime } from '@src/saga/sagaUtils';
import { IProviderContructor, StrIdx } from '@src/types';
import { createMockProxyHandler, MockProvider } from '@test/mockNode';
import { getFinishedCallsByProviderId } from '@test/selectors';
import { makeMockProviderConfig } from '@test/utils';
import { setTimeout } from 'timers';
import { promisify } from 'util';
import { IIndex } from './index';

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
        expect(e.message).toEqual('mock node error');
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
      'should handle a failed call via balancer level timeout',
      async () => {
        const { shepherd, redux } = getAPI();
        const failingProvider = makeMockProviderConfig({
          concurrency: 2,
          network: 'ETH',
          requestFailureThreshold: 3,
          timeoutThresholdMs: 3000,
        });

        const node = await shepherd.init({
          customProviders: { MockProvider: MockProviderImplem },

          network: 'ETH',
        });

        shepherd.useProvider(
          'MockProvider',
          'failingProvider',
          failingProvider,
          new MockProvider(),
          createMockProxyHandler({ baseDelay: 0, failureRate: 100 }),
        );
        try {
          await node.getBalance('0x');
        } catch (e) {
          const state = redux.store.getState();
          // check that the number of retries is 3
          expect(getProviderCallById(state, 0).numOfRetries).toEqual(3);
          // check that the provider failed 3 times, goes offline, then goes back online
          // then is set to 0, then call times out on balancer side before it can try again and put a failed call

          expect(
            getProviderStatsById(state, 'failingProvider')!.requestFailures,
          ).toEqual(0); // TODO: write another version of this test that checks for 1, will need to have the polling-rate adjustable so it's
          expect(e.message).toEqual('Call Flushed');
        }

        const workingProvider = makeMockProviderConfig({
          concurrency: 2,
          network: 'ETH',
          requestFailureThreshold: 3,
          timeoutThresholdMs: 3000,
        });

        shepherd.useProvider(
          'MockProvider',
          'workingProvider',
          workingProvider,
          new MockProvider(),
          createMockProxyHandler({ baseDelay: 0, failureRate: 0 }),
        );

        await node.getBalance('0x');
      },
      8000,
    );

    it(
      'should handle a failed call via too many retries',
      async done => {
        const { shepherd, redux } = getAPI();
        const failingProvider = makeMockProviderConfig({
          concurrency: 2,
          network: 'ETH',
          requestFailureThreshold: 4,
          timeoutThresholdMs: 3000,
        });

        const node = await shepherd.init({
          customProviders: { MockProvider: MockProviderImplem },
          providerCallRetryThreshold: 2,
          network: 'ETH',
        });

        shepherd.useProvider(
          'MockProvider',
          'failingProvider',
          failingProvider,
          new MockProvider(),
          createMockProxyHandler({ baseDelay: 0, failureRate: 100 }),
        );
        try {
          await node.getBalance('0x');
        } catch (e) {
          const state = redux.store.getState();
          // check that the number of retries is 3
          expect(getProviderCallById(state, 0).numOfRetries).toEqual(2);
          // check that the provider failed 3 times, goes offline, then goes back online
          // then is set to 0, then call times out on balancer side before it can try again and put a failed call
          expect(
            getProviderStatsById(state, 'failingProvider')!.requestFailures,
          ).toEqual(3); // TODO: write another version of this test that checks for 1, will need to have the polling-rate adjustable so it's
          expect(e.message).toEqual('mock node error');
          done();
        }
      },
      6000,
    );

    it(
      'should poll nodes that are offline',
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
      6500,
    );
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
      10000,
    );

    it('should handle timeouts on a single provider', async () => {
      const { shepherd, redux: { store } } = getAPI();
      const eth1 = makeMockProviderConfig({
        concurrency: 2,
        network: 'ETH',
        requestFailureThreshold: 4,
        timeoutThresholdMs: 200,
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
          baseDelay: 400,
          failureRate: 0,
          failDelay: 0,
          getCurrentBlockDelay: 1,
        }),
      );
      try {
        await node.getBalance('0x');
      } catch (e) {
        expect(getProviderCallById(store.getState(), 0).providerId).toEqual(
          'eth1',
        );
        expect(getProviderCallById(store.getState(), 0).pending).toEqual(false);
        expect(getProviderCallById(store.getState(), 0).error).toEqual(
          'Request timed out for eth1',
        );
      }
    });
  });

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
      7500,
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

    it(
      'should handle a manual provider timing out',
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

        await asyncTimeout(5000);
      },
      15000,
    );
  });
});
