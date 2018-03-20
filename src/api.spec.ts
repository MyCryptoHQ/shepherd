import { shepherd } from './index';
import { StrIdx, IProviderContructor } from '@src/types';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { makeMockProviderConfig } from '@test/utils';
import { createMockProxyHandler, MockProvider } from '@test/mockNode';
import { promisify } from 'util';
import { setTimeout } from 'timers';
import { redux } from './index';
import { getFinishedCallsByProviderId } from '@src/ducks/providerBalancer/providerCalls';

jest.setTimeout(9999999);

describe('Api tests', () => {
  const instance = new MockProvider();

  const providerConfigs: StrIdx<IProviderConfig> = {
    eth1: makeMockProviderConfig({
      concurrency: 4,
      network: 'ETH',
      requestFailureThreshold: 3,
      supportedMethods: { getTransactionCount: false },
      timeoutThresholdMs: 3000,
    }),

    eth2: makeMockProviderConfig({
      concurrency: 4,
      network: 'ETH',
      requestFailureThreshold: 2,
      supportedMethods: { getBalance: false },
      timeoutThresholdMs: 3000,
    }),

    etc1: makeMockProviderConfig({
      concurrency: 4,
      network: 'ETC',
      requestFailureThreshold: 3,

      timeoutThresholdMs: 3000,
    }),
  };
  const node = shepherd.init({
    network: 'ETH',
    customProviders: { mock: (Proxy as any) as IProviderContructor },
  });

  it('should initialize and process the call', done => {
    node.getBalance('0x').then(() => done());

    shepherd.useProvider(
      'mock',
      'eth1',
      providerConfigs.eth1,
      instance,
      createMockProxyHandler({ baseDelay: 500, failureRate: 0 }),
    );

    shepherd.useProvider(
      'mock',
      'eth2',
      providerConfigs.eth2,
      instance,
      createMockProxyHandler({ baseDelay: 500, failureRate: 0 }),
    );

    shepherd.useProvider(
      'mock',
      'etc1',
      providerConfigs.etc1,
      instance,
      createMockProxyHandler({ baseDelay: 1000, failureRate: 0 }),
    );
  });

  it('should switch networks and process the call', done => {
    node.getCurrentBlock();
    shepherd.switchNetworks('ETC');
    node.getCurrentBlock().then(() => done());
  });

  it('should balance between providers', done => {
    const providerConfigs: StrIdx<IProviderConfig> = {
      etg1: makeMockProviderConfig({
        concurrency: 20,
        network: 'ETG',
        requestFailureThreshold: 3,
        supportedMethods: { getTransactionCount: false },
        timeoutThresholdMs: 3000,
      }),

      etg2: makeMockProviderConfig({
        concurrency: 20,
        network: 'ETG',
        requestFailureThreshold: 2,
        supportedMethods: { getBalance: false },
        timeoutThresholdMs: 3000,
      }),

      etg3: makeMockProviderConfig({
        concurrency: 20,
        network: 'ETG',
        requestFailureThreshold: 3,
        timeoutThresholdMs: 3000,
      }),

      etg4: makeMockProviderConfig({
        concurrency: 20,
        network: 'ETG',
        requestFailureThreshold: 3,
        supportedMethods: { getTransactionCount: false },
        timeoutThresholdMs: 3000,
      }),
    };

    shepherd.useProvider(
      'mock',
      'etg1',
      providerConfigs.etg1,
      instance,
      createMockProxyHandler({ baseDelay: 400, failureRate: 0 }),
    );

    shepherd.useProvider(
      'mock',
      'etg2',
      providerConfigs.etg2,
      instance,
      createMockProxyHandler({ baseDelay: 2000, failureRate: 0 }),
    );

    shepherd.useProvider(
      'mock',
      'etg3',
      providerConfigs.etg3,
      instance,
      createMockProxyHandler({ baseDelay: 200, failureRate: 0 }),
    );

    shepherd.useProvider(
      'mock',
      'etg4',
      providerConfigs.etg4,
      instance,
      createMockProxyHandler({ baseDelay: 600, failureRate: 0 }),
    );

    shepherd.switchNetworks('ETG');

    const asyncTimeout = promisify(setTimeout);
    let arr: any[] = [];

    window.setTimeout(async () => {
      for (let i = 0; i < 200; i++) {
        await asyncTimeout(70);
        node.getBalance('0x');
      }
      console.log('done');
    }, 1000);

    window.setTimeout(() => {
      const state = redux.store.getState();
      const etg1 = getFinishedCallsByProviderId(state, 'etg1');
      const etg3 = getFinishedCallsByProviderId(state, 'etg3');
      const etg4 = getFinishedCallsByProviderId(state, 'etg4');

      console.log(
        `etg1 ${etg1} ${etg1 / 200}% etg3 ${etg3} ${etg3 /
          200}% etg4 ${etg4} ${etg4 / 200 * 100}%`,
      );
      done();
    }, 20000);
  });
});
