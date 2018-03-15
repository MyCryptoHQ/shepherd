import * as selectors from './selectors';
import * as providerConfigsActions from './providerConfigs/configs/actions';
import * as balancerConfigActions from './providerBalancer/balancerConfig/actions';
import * as providerCallsActions from './providerBalancer/providerCalls/actions';
import * as providerStatsActions from './providerBalancer/providerStats/actions';
import * as workersActions from './providerBalancer/workers/actions';
import { rootReducer, store } from '@src/ducks';
import { StrIdx } from '@src/types';
import { IProviderConfig } from '@src/ducks/providerConfigs/configs';
import {
  makeMockProviderConfig,
  makeMockStats,
  makeMockWorker,
  makeMockCall,
} from '@test/utils';

let storage: any = undefined;
describe('Ducks tests', () => {
  const addAllProviderConfigs = (
    _storage: any,
    configs: StrIdx<IProviderConfig>,
  ) => {
    for (const [id, config] of Object.entries(configs)) {
      const action = providerConfigsActions.addProviderConfig({ id, config });
      _storage = rootReducer(_storage, action);
    }
    return _storage;
  };

  describe('getAllProvidersOfCurrentNetwork selector', () => {
    const providers: StrIdx<IProviderConfig> = {
      eth1: makeMockProviderConfig(),
      eth2: makeMockProviderConfig(),
      etc1: makeMockProviderConfig({ network: 'ETC' }),
      exp1: makeMockProviderConfig({ network: 'EXP' }),
    };
    const selector = selectors.getAllProvidersOfCurrentNetwork;

    it('should select providers that have the network of "ETH"', () => {
      storage = addAllProviderConfigs(storage, providers);
      expect(selector(storage)).toEqual({
        eth1: providers.eth1,
        eth2: providers.eth2,
      });
    });
    it('should select providers that have the network of "ETC"', () => {
      const action = balancerConfigActions.balancerNetworkSwitchSucceeded({
        providerStats: {},
        workers: {},
        network: 'ETC',
      });

      storage = rootReducer(storage, action);
      expect(selector(storage)).toEqual({ etc1: providers.etc1 });
    });
    it('should select no providers', () => {
      const action = balancerConfigActions.balancerNetworkSwitchSucceeded({
        network: 'BLA',
        providerStats: {},
        workers: {},
      });
      storage = rootReducer(storage, action);
      expect(selector(storage)).toEqual({});
    });
  });

  describe('getAllMethodsAvailable selector', () => {
    const selector = selectors.getAllMethodsAvailable;

    it('should return true', () => {
      storage = undefined;

      storage = addAllProviderConfigs(storage, {
        p1: makeMockProviderConfig(),
      });

      storage = rootReducer(
        storage,
        providerStatsActions.providerAdded({
          providerId: 'p1',
          stats: makeMockStats({ currWorkersById: ['worker1'] }),
          workers: { worker1: makeMockWorker({ assignedProvider: 'p1' }) },
        }),
      );
      expect(selector(storage)).toEqual(true);
    });

    it('should return false', () => {
      storage = undefined;

      storage = addAllProviderConfigs(storage, {
        p1: makeMockProviderConfig(),
      });

      expect(selector(storage)).toEqual(false);
    });

    it('should return false', () => {
      storage = rootReducer(undefined as any, {} as any);
      expect(selector(storage)).toEqual(false);
    });

    it('should return false', () => {
      const configs = {
        p1: makeMockProviderConfig({
          supportedMethods: { estimateGas: false, getBalance: false },
        }),
        p2: makeMockProviderConfig({
          supportedMethods: { estimateGas: false },
        }),
      };
      storage = undefined;
      storage = addAllProviderConfigs(storage, configs);

      const action1 = providerStatsActions.providerAdded({
        providerId: 'p1',
        stats: makeMockStats({ currWorkersById: ['worker1'] }),
        workers: { worker1: makeMockWorker({ assignedProvider: 'p1' }) },
      });

      const action2 = providerStatsActions.providerAdded({
        providerId: 'p2',
        stats: makeMockStats({ currWorkersById: ['worker2'] }),
        workers: { worker2: makeMockWorker({ assignedProvider: 'p2' }) },
      });
      storage = rootReducer(storage, action1);
      storage = rootReducer(storage, action2);

      expect(selector(storage)).toEqual(false);
    });

    it('should return true', () => {
      storage = addAllProviderConfigs(storage, {
        p3: makeMockProviderConfig({
          supportedMethods: { getBalance: false, getTransactionCount: false },
        }),
      });

      storage = rootReducer(
        storage,
        providerStatsActions.providerAdded({
          providerId: 'p3',
          stats: makeMockStats({ currWorkersById: ['worker3'] }),
          workers: { worker3: makeMockWorker({ assignedProvider: 'p3' }) },
        }),
      );

      expect(selector(storage)).toEqual(true);
    });

    it('should return false', () => {
      storage = rootReducer(
        storage,
        providerStatsActions.providerOffline({ providerId: 'p3' }),
      );

      expect(selector(storage)).toEqual(false);
    });

    it('should return true', () => {
      storage = rootReducer(
        storage,
        providerStatsActions.providerOnline({ providerId: 'p3' }),
      );
      expect(selector(storage)).toEqual(true);
    });

    it('should return false', () => {
      storage = rootReducer(
        storage,
        providerConfigsActions.changeProviderConfig({
          id: 'p3',
          config: { supportedMethods: { estimateGas: false } },
        }),
      );

      expect(selector(storage)).toEqual(false);
    });

    it('should return true', () => {
      storage = rootReducer(
        storage,
        providerConfigsActions.changeProviderConfig({
          id: 'p3',
          config: { supportedMethods: { estimateGas: true } },
        }),
      );

      expect(selector(storage)).toEqual(true);
    });
  });

  describe('getAvailableProviderId selector', () => {
    const selector = selectors.getAvailableProviderId;
    it('', () => {
      const call = makeMockCall();
    });
  });
});
