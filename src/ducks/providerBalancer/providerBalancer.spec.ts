import { INITIAL_ROOT_STATE } from '@src/ducks';
import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';

describe('Provider balancer tests', () => {
  it('should return the provider balancer', () => {
    expect(getProviderBalancer(INITIAL_ROOT_STATE)).toEqual({
      balancerConfig: {
        manual: false,
        network: 'ETH',
        offline: true,
        providerCallRetryThreshold: 3,
        networkSwitchPending: false,
        queueTimeout: 5000,
      },
      providerCalls: {},
      providerStats: {},
      workers: {},
    });
  });
});
