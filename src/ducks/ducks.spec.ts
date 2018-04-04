import { rootReducer } from '@src/ducks';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { StrIdx } from '@src/types';
import {
  makeMockCall,
  makeMockProviderConfig,
  makeMockStats,
  makeMockWorker,
} from '@test/utils';
import * as balancerConfigActions from './providerBalancer/balancerConfig/actions';
import * as providerCallsActions from './providerBalancer/providerCalls/actions';
import * as providerStatsActions from './providerBalancer/providerStats/actions';
import * as workerActions from './providerBalancer/workers/actions';
import * as providerConfigsActions from './providerConfigs/actions';
import * as selectors from './selectors';

const addAllProviderConfigs = (stor: any, configs: StrIdx<IProviderConfig>) => {
  for (const [id, config] of Object.entries(configs)) {
    const action = providerConfigsActions.addProviderConfig({ id, config });

    stor = rootReducer(stor, action);
  }
  return stor;
};

const addAllProviderStats = (stor: any, providerIds: string[]) => {
  providerIds.forEach(id => {
    const actionCreator = providerStatsActions.providerAdded;
    const workerId = `${id}_worker`;
    const action = actionCreator({
      providerId: id,
      stats: makeMockStats({ currWorkersById: [workerId] }),
      workers: { [workerId]: makeMockWorker({ assignedProvider: id }) },
    });

    stor = rootReducer(stor, action);
  });
  return stor;
};

let storage: any;
describe('Ducks tests', () => {
  describe('getAllProvidersOfCurrentNetwork selector', () => {
    const providers: StrIdx<IProviderConfig> = {
      eth1: makeMockProviderConfig(),
      eth2: makeMockProviderConfig(),
      etc1: makeMockProviderConfig({ network: 'ETC' }),
      exp1: makeMockProviderConfig({ network: 'EXP' }),
    };
    const selector = selectors.getAllProvidersOfNetwork;

    it('should select providers that have the network of "ETH"', () => {
      storage = addAllProviderConfigs(storage, providers);
      expect(selector(storage, 'ETH')).toEqual({
        eth1: providers.eth1,
        eth2: providers.eth2,
      });
    });
    it('should select providers that have the network of "ETC"', () => {
      expect(selector(storage, 'ETC')).toEqual({ etc1: providers.etc1 });
    });
    it('should select no providers', () => {
      expect(selector(storage, 'BLA')).toEqual({});
    });
  });

  describe('getOnlineProviderIdsOfCurrentNetwork selector', () => {
    const selector = selectors.getOnlineProviderIdsOfCurrentNetwork;

    const configs: StrIdx<IProviderConfig> = {
      eth1: makeMockProviderConfig({
        supportedMethods: { estimateGas: false },
      }),
      eth2: makeMockProviderConfig(),

      etc1: makeMockProviderConfig({ network: 'ETC' }),
      exp1: makeMockProviderConfig({ network: 'EXP' }),
    };

    it('should select no providers', () => {
      storage = undefined;
      storage = addAllProviderConfigs(storage, configs);
      expect(selector(storage)).toEqual([]);
    });

    it('should select online providers of eth network', () => {
      storage = undefined;
      storage = addAllProviderConfigs(storage, configs);
      storage = addAllProviderStats(storage, Object.keys(configs));
      expect(selector(storage)).toEqual(['eth1', 'eth2']);
    });

    it('should select online providers of eth network', () => {
      storage = rootReducer(
        storage,
        providerStatsActions.providerOffline({ providerId: 'eth1' }),
      );
      expect(selector(storage)).toEqual(['eth2']);
    });

    it('should select online providers of etc network', () => {
      storage = undefined;
      storage = rootReducer(
        storage,
        balancerConfigActions.balancerNetworkSwitchSucceeded({
          network: 'ETC',
          providerStats: {},
          workers: {},
        }),
      );
      storage = addAllProviderConfigs(storage, configs);
      storage = addAllProviderStats(storage, Object.keys(configs));
      expect(selector(storage)).toEqual(['etc1']);
    });
  });

  describe('getAllMethodsAvailable selector', () => {
    const selector = selectors.getAllMethodsAvailable;

    it('should return false', () => {
      storage = undefined;

      storage = rootReducer(
        storage,
        providerStatsActions.providerAdded({
          providerId: 'p1',
          stats: makeMockStats({ currWorkersById: ['worker1'] }),
          workers: { worker1: makeMockWorker({ assignedProvider: 'p1' }) },
        }),
      );
      expect(selector(storage)).toEqual(false);
    });

    it('should return false', () => {
      storage = undefined;

      storage = addAllProviderConfigs(storage, {
        p1: makeMockProviderConfig({ network: 'ETC' }),
      });

      storage = rootReducer(
        storage,
        providerStatsActions.providerAdded({
          providerId: 'p1',
          stats: makeMockStats({ currWorkersById: ['worker1'] }),
          workers: { worker1: makeMockWorker({ assignedProvider: 'p1' }) },
        }),
      );
      expect(selector(storage)).toEqual(false);
    });

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

    /**
     * Manual mode tests
     */
    it('should return false', () => {
      storage = rootReducer(
        storage,
        balancerConfigActions.setManualSucceeded({ providerId: 'p2' }),
      );
      expect(selector(storage)).toEqual(false);
    });

    it('should return true', () => {
      storage = rootReducer(
        storage,
        balancerConfigActions.setManualSucceeded({ providerId: 'p3' }),
      );

      storage = rootReducer(
        storage,
        providerConfigsActions.changeProviderConfig({
          id: 'p3',
          config: {
            supportedMethods: { getTransactionCount: true, getBalance: true },
          },
        }),
      );
      expect(selector(storage)).toEqual(true);
    });

    it('should return false', () => {
      storage = rootReducer(
        storage,
        balancerConfigActions.setManualSucceeded({ providerId: 'p1' }),
      );
      expect(selector(storage)).toEqual(false);
    });

    it('should return true', () => {
      storage = rootReducer(
        storage,
        providerConfigsActions.changeProviderConfig({
          id: 'p3',
          config: {
            supportedMethods: { getTransactionCount: false, getBalance: false },
          },
        }),
      );

      storage = rootReducer(storage, balancerConfigActions.setAuto());
      expect(selector(storage)).toEqual(true);
    });
  });

  describe('getAvailableProviderId selector', () => {
    const selector = selectors.getAvailableProviderId;

    describe('testing priority filters of minPriorityProviderList and providerWhiteList ', () => {
      // setup a map of provider configs
      const configs: StrIdx<IProviderConfig> = {
        eth1: makeMockProviderConfig({
          supportedMethods: { estimateGas: false },
        }),
        eth2: makeMockProviderConfig({ supportedMethods: { ping: false } }),
        eth3: makeMockProviderConfig({
          supportedMethods: { getTransactionCount: false },
        }),
        etc1: makeMockProviderConfig({ network: 'ETC' }),
        exp1: makeMockProviderConfig({ network: 'EXP' }),
      };

      it('should prioritize properly', () => {
        storage = undefined;
        storage = addAllProviderConfigs(storage, configs);
        storage = addAllProviderStats(storage, Object.keys(configs));
        const call = makeMockCall({ rpcMethod: 'getBalance' });
        expect(selector(storage, call)).toEqual('eth1');
      });

      it('should prioritize properly', () => {
        const call = makeMockCall({
          rpcMethod: 'getBalance',
          providerWhiteList: ['eth3'],
        });
        expect(selector(storage, call)).toEqual('eth3');
      });

      it('should prioritize properly', () => {
        const call = makeMockCall({
          rpcMethod: 'getBalance',
          providerWhiteList: ['eth3'],
        });
        expect(selector(storage, call)).toEqual('eth3');
      });

      it('should prioritize properly', () => {
        const call = makeMockCall({
          rpcMethod: 'getBalance',
          minPriorityProviderList: ['eth1'],
        });
        expect(selector(storage, call)).toEqual('eth2');
      });

      it('should prioritize properly', () => {
        const call = makeMockCall({
          rpcMethod: 'getBalance',
          minPriorityProviderList: ['eth1', 'eth2', 'eth3'],
        });
        expect(selector(storage, call)).toEqual('eth1');
      });

      it('should prioritize properly', () => {
        const call = makeMockCall({
          rpcMethod: 'getBalance',
          minPriorityProviderList: ['eth1', 'eth3'],
        });
        expect(selector(storage, call)).toEqual('eth2');
      });

      it('should prioritize properly', () => {
        const call = makeMockCall({
          rpcMethod: 'getBalance',
          minPriorityProviderList: ['eth1'],
          providerWhiteList: ['eth1'],
        });
        expect(selector(storage, call)).toEqual('eth1');
      });

      it('should prioritize properly', () => {
        const call = makeMockCall({
          rpcMethod: 'getBalance',
          providerWhiteList: ['metamask'],
        });
        expect(selector(storage, call)).toEqual(null);
      });
    });

    describe('testing prioritiation based on number of current requests given otherwise equal providers', () => {
      // setup a map of provider configs
      const configs: StrIdx<IProviderConfig> = {
        eth1: makeMockProviderConfig(),
        eth2: makeMockProviderConfig(),
        eth3: makeMockProviderConfig(),
      };

      it('should prioritize properly', () => {
        storage = undefined;
        storage = addAllProviderConfigs(storage, configs);
        storage = addAllProviderStats(storage, Object.keys(configs));
        const call = makeMockCall({
          callId: 1,
          rpcMethod: 'getBalance',
          providerId: 'eth1',
        });
        storage = rootReducer(
          storage,
          providerCallsActions.providerCallRequested(call),
        );
        expect(selector(storage, call)).toEqual('eth2');
      });
      it('should prioritize properly', () => {
        const call = makeMockCall({
          callId: 2,
          rpcMethod: 'getBalance',
          providerId: 'eth2',
        });
        storage = rootReducer(
          storage,
          providerCallsActions.providerCallRequested(call),
        );
        expect(selector(storage, call)).toEqual('eth3');
      });

      it('should prioritize properly', () => {
        const call = makeMockCall({
          callId: 3,
          rpcMethod: 'getBalance',
          providerId: 'eth3',
        });
        storage = rootReducer(
          storage,
          providerCallsActions.providerCallRequested(call),
        );
        expect(selector(storage, call)).toEqual('eth1');
      });

      it('should prioritize properly', () => {
        const call = makeMockCall({
          callId: 4,
          rpcMethod: 'getBalance',
          providerId: 'eth2',
        });
        storage = rootReducer(
          storage,
          providerCallsActions.providerCallRequested(call),
        );
        expect(selector(storage, call)).toEqual('eth1');
      });

      it('should prioritize properly', () => {
        const call = makeMockCall({
          callId: 5,
          rpcMethod: 'getBalance',
          providerId: 'eth1',
        });
        storage = rootReducer(
          storage,
          providerCallsActions.providerCallRequested(call),
        );
        expect(selector(storage, call)).toEqual('eth3');
      });
    });
  });

  describe('providerExceedsRequestFailureThreshold', () => {
    const selector = selectors.providerExceedsRequestFailureThreshold;

    // setup a map of provider configs
    const configs: StrIdx<IProviderConfig> = {
      eth1: makeMockProviderConfig({
        supportedMethods: { estimateGas: false },
      }),
      eth2: makeMockProviderConfig({ supportedMethods: { ping: false } }),
      eth3: makeMockProviderConfig({
        supportedMethods: { getTransactionCount: false },
      }),
      etc1: makeMockProviderConfig({ network: 'ETC' }),
      exp1: makeMockProviderConfig({ network: 'EXP' }),
    };

    const call: any = makeMockCall({ providerId: 'eth2' });

    const timeoutAction = providerCallsActions.providerCallTimeout({
      error: Error(),
      providerCall: call,
    });

    it('should return false', () => {
      storage = undefined;
      storage = addAllProviderConfigs(storage, configs);
      //expect to throw
      expect(() =>
        selector(rootReducer(undefined as any, {} as any), timeoutAction),
      ).toThrow('Could not find provider stats or config');

      storage = addAllProviderStats(storage, Object.keys(configs));
      const action1 = providerCallsActions.providerCallRequested(call);
      storage = rootReducer(storage, action1);

      storage = rootReducer(
        storage,
        workerActions.workerProcessing({
          workerId: 'eth2_worker',
          currentPayload: call,
        }),
      );

      storage = rootReducer(storage, timeoutAction);
      expect(selector(storage, timeoutAction)).toEqual(false);
    });
    it('should return true', () => {
      const action = providerConfigsActions.changeProviderConfig({
        id: 'eth2',
        config: { requestFailureThreshold: 1 },
      });
      storage = rootReducer(storage, action);
      expect(selector(storage, timeoutAction)).toEqual(true);
    });
  });
});
