import { shepherd } from './index';
import { StrIdx, IProviderContructor } from '@src/types';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { makeMockProviderConfig } from '@test/utils';
import { createMockProxyHandler, MockProvider } from '@test/mockNode';
jest.setTimeout(99999);
describe('Api tests', () => {
  it.skip('should initialize', done => {
    const providerConfigs: StrIdx<IProviderConfig> = {
      eth1: makeMockProviderConfig({
        concurrency: 4,
        network: 'ETH',
        requestFailureThreshold: 3,
        supportedMethods: { getCurrentBlock: false },
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
        supportedMethods: { getCurrentBlock: false },
        timeoutThresholdMs: 3000,
      }),
    };
    shepherd.init({
      network: 'ETH',
      customProviders: { mock: (Proxy as any) as IProviderContructor },
    });

    const instance = new MockProvider();
    console.log(instance.ping());
    console.log(Object.keys(instance));
    shepherd.useProvider(
      'mock',
      'eth1',
      providerConfigs.eth1,
      instance,
      createMockProxyHandler({ baseDelay: 500, failureRate: 100 }),
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
      createMockProxyHandler({ baseDelay: 500, failureRate: 0 }),
    );
    //done();
  });
});
