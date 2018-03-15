import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';
import { INITIAL_ROOT_STATE } from '@src/ducks';

describe('Provider balancer tests', () => {
  it('should return the provider balancer', () => {
    expect(getProviderBalancer(INITIAL_ROOT_STATE)).toEqual({
      balancerConfig: {
        manual: false,
        network: 'ETH',
        offline: true,
        providerCallRetryThreshold: 3,
      },
      providerCalls: {},
      providerStats: {},
      workers: {},
    });
  });
});
