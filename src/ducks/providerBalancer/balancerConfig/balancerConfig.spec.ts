import { INITIAL_ROOT_STATE, rootReducer } from '@src/ducks';
import * as actions from './actions';
import * as selectors from './selectors';

describe('Balancer config tests', () => {
  describe('Selectors on inital state tests ', () => {
    it('should select manual mode as false', () => {
      expect(selectors.getManualMode(INITIAL_ROOT_STATE)).toEqual(false);
    });

    it('should select offline as true', () => {
      expect(selectors.isOffline(INITIAL_ROOT_STATE)).toEqual(true);
    });

    it('should select the network as "ETH"', () => {
      expect(selectors.getNetwork(INITIAL_ROOT_STATE)).toEqual('ETH');
    });

    it('should select the providerRetryThreshold as "3"', () => {
      expect(
        selectors.getProviderCallRetryThreshold(INITIAL_ROOT_STATE),
      ).toEqual(3);
    });

    it('should select the entire inital state', () => {
      expect(selectors.getBalancerConfig(INITIAL_ROOT_STATE)).toEqual({
        manual: false,
        offline: true,
        network: 'ETH',
        providerCallRetryThreshold: 3,
      });
    });
  });

  describe('Action/Selector tests', () => {
    it('should change the providerCallRetryThreshold to 4', () => {
      // TODO: check for negative thresholds
      const action = actions.balancerSetProviderCallRetryThreshold({
        threshold: 4,
      });
      const selector = selectors.getProviderCallRetryThreshold;
      expect(selector(rootReducer(undefined as any, action))).toEqual(4);
    });
    it('should set the balancer to online', () => {
      const action = actions.setOnline();
      const selector = selectors.isOffline;

      expect(selector(rootReducer(undefined as any, action))).toEqual(false);
    });
    it('should set the balancer to offline', () => {
      const action = actions.setOffline();
      const selector = selectors.isOffline;
      expect(selector(rootReducer(undefined as any, action))).toEqual(true);
    });

    it('should set the balancer to manual and then back to auto', () => {
      let state: any = undefined;
      const selector = selectors.getManualMode;
      state = rootReducer(state, actions.setManual({ providerId: 'metamask' }));

      expect(selector(state)).toEqual('metamask');

      state = rootReducer(state, actions.setAuto());
      expect(selector(state)).toEqual(false);
    });

    it('should set the network after a successful network switch', () => {
      const action = actions.balancerNetworkSwitchSucceeded({
        network: 'ETC',
        providerStats: {},
        workers: {},
      });
      const selector = selectors.getNetwork;
      expect(selector(rootReducer(undefined as any, action))).toEqual('ETC');
    });
  });
});
