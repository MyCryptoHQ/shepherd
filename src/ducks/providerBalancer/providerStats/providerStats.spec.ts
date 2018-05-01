import { INITIAL_ROOT_STATE } from '@src/ducks';
import { mockCall } from '@src/ducks/providerBalancer/providerCalls/providerCalls.spec';
import { IProviderStats } from '@src/ducks/providerBalancer/providerStats';
import { IStrIdx } from '@src/types';
import { Task } from 'redux-saga';
import * as balancerActions from '../balancerConfig/actions';
import * as providerCallActions from '../providerCalls/actions';
import * as workerActions from '../workers/actions';
import * as statsActions from './actions';
import { providerStatsReducer } from './reducer';
import * as selectors from './selectors';

const stateAssigner = (reducerResult: any) => {
  const stateCopy = JSON.parse(JSON.stringify(INITIAL_ROOT_STATE));
  stateCopy.providerBalancer.providerStats = reducerResult;
  return stateCopy;
};

const states: IStrIdx<any> = {};

export const mockProviderStats: IProviderStats = {
  avgResponseTime: 0,
  currWorkersById: ['worker1', 'worker2'],
  isOffline: false,
  requestFailures: 0,
};

describe('Provider stats tests', () => {
  describe('Selectors on initial state tests', () => {
    it('should select undefined when called with a non-existent provider id', () => {
      expect(selectors.getProviderStatsById(INITIAL_ROOT_STATE, '')).toEqual(
        undefined,
      );
    });

    it('should select an empty object for getting provider stats', () => {
      expect(selectors.getProviderStats(INITIAL_ROOT_STATE)).toEqual({});
    });

    it('should select an empty object', () => {
      expect(selectors.getOnlineProviders(INITIAL_ROOT_STATE)).toEqual({});
    });
  });

  describe('Action/Selector tests', () => {
    it('should handle a provider being added', () => {
      const action = statsActions.providerAdded({
        providerId: 'mock1',
        stats: mockProviderStats,
        workers: {},
      });
      const selector = selectors.getProviderStatsById;

      states.providerAdded = providerStatsReducer(undefined as any, action);
      const state = stateAssigner(states.providerAdded);
      expect(selector(state, 'mock1')).toEqual(mockProviderStats);

      // test case for duplicate addition
      expect(() => providerStatsReducer(states.providerAdded, action)).toThrow(
        'Provider mock1 already exists',
      );
    });

    it('should handle a provider going offline', () => {
      const action = statsActions.providerOffline({ providerId: 'mock1' });
      const selector = selectors.getProviderStatsById;
      states.providerOffline = providerStatsReducer(
        states.providerAdded,
        action,
      );
      const state = stateAssigner(states.providerOffline);
      expect(selector(state, 'mock1')).toEqual({
        ...mockProviderStats,
        isOffline: true,
      });

      // returns original state on no provider
      expect(
        providerStatsReducer(
          states.providerAdded,
          statsActions.providerOffline({ providerId: 'blabla' }),
        ),
      ).toEqual(states.providerAdded);
    });

    it('should handle a provider going online', () => {
      const action = statsActions.providerOnline({ providerId: 'mock1' });
      const selector = selectors.getProviderStatsById;
      states.providerOnline = providerStatsReducer(
        states.providerOffline,
        action,
      );
      const state = stateAssigner(states.providerOnline);
      expect(selector(state, 'mock1')).toEqual({
        ...mockProviderStats,
        isOffline: false,
      });

      // check for non-existence
      expect(() => providerStatsReducer(undefined as any, action)).toThrow(
        'Provider mock1 does not exist',
      );
    });

    it('should handle a provider being removed', () => {
      const action = statsActions.providerRemoved({ providerId: 'mock1' });
      const selector = selectors.getProviderStatsById;
      states.providerRemoved = providerStatsReducer(
        states.providerAdded,
        action,
      );
      const state = stateAssigner(states.providerRemoved);
      expect(selector(state, 'mock1')).toEqual(undefined);

      // check for non-existence
      expect(() =>
        providerStatsReducer(states.providerRemoved, action),
      ).toThrow('Provider mock1 does not exist');
    });

    it('should handle a worker being spawned', () => {
      const action = workerActions.workerSpawned({
        providerId: 'mock1',
        workerId: 'worker3',
        task: {} as Task,
      });
      const selector = selectors.getProviderStatsById;
      states.workerSpawned = providerStatsReducer(states.providerAdded, action);
      const state = stateAssigner(states.workerSpawned);
      expect(selector(state, 'mock1')).toEqual({
        ...mockProviderStats,
        currWorkersById: [...mockProviderStats.currWorkersById, 'worker3'],
      });

      // check for non-existence of provider
      expect(() =>
        providerStatsReducer(states.providerRemoved, action),
      ).toThrow('Provider mock1 does not exist');

      // check for duplicate workers
      const failAction = workerActions.workerSpawned({
        providerId: 'mock1',
        workerId: 'worker2',
        task: {} as Task,
      });
      expect(() =>
        providerStatsReducer(states.providerAdded, failAction),
      ).toThrow('Worker worker2 already exists');
    });

    it('should handle a worker being killed', () => {
      const action = workerActions.workerKilled({
        error: Error('worker1 killed'),
        providerId: 'mock1',
        workerId: 'worker1',
      });
      const selector = selectors.getProviderStatsById;
      states.workerKilled = providerStatsReducer(states.providerAdded, action);
      const state = stateAssigner(states.workerKilled);
      expect(selector(state, 'mock1')).toEqual({
        ...mockProviderStats,
        currWorkersById: ['worker2'],
      });

      // check for non-existence of provider
      expect(() =>
        providerStatsReducer(states.providerRemoved, action),
      ).toThrow('Provider mock1 does not exist');

      // check for non-existence of worker
      expect(() => providerStatsReducer(states.workerKilled, action)).toThrow(
        'Worker worker1 does not exist',
      );
    });

    it('should handle a provider call timeout', () => {
      const action = providerCallActions.providerCallTimeout({
        error: Error('mock timeout'),
        providerCall: mockCall,
      });

      const selector = selectors.getProviderStatsById;
      states.providerCallTimeout = providerStatsReducer(
        states.providerAdded,
        action,
      );
      const state = stateAssigner(states.providerCallTimeout);

      expect(selector(state, 'mock1')).toEqual({
        ...mockProviderStats,
        requestFailures: 1,
      });

      // check for non-existence of provider
      expect(() =>
        providerStatsReducer(states.providerRemoved, action),
      ).toThrow('Provider mock1 does not exist');
    });

    it('should handle a balancer flush', () => {
      const action = balancerActions.balancerFlush();
      const selector = selectors.getProviderStatsById;
      states.balancerFlush = providerStatsReducer(
        states.providerCallTimeout,
        action,
      );
      const state = stateAssigner(states.balancerFlush);

      expect(selector(state, 'mock1')).toEqual({
        ...mockProviderStats,
        requestFailures: 0,
      });
    });

    it('should handle a successful network switch', () => {
      const mockProviderStatsState = {
        mock1: { ...mockProviderStats, workers: [] },
        mock2: { ...mockProviderStats, workers: [] },
      };
      const action = balancerActions.balancerNetworkSwitchSucceeded(
        {
          network: 'ETC',
          providerStats: mockProviderStatsState,
          workers: {},
        },
        0,
      );
      states.networkSwitchSucceeded = providerStatsReducer(
        states.providerAdded,
        action,
      );
      const selector = selectors.getProviderStats;

      const state = stateAssigner(states.networkSwitchSucceeded);
      expect(selector(state)).toEqual(mockProviderStatsState);

      // handle below zero response time
      const belowZeroMockProviderStatsState = {
        mock1: { ...mockProviderStats, workers: [], avgResponseTime: -1 },
        mock2: { ...mockProviderStats, workers: [] },
      };

      const belowZeroResponseTimeAction = balancerActions.balancerNetworkSwitchSucceeded(
        {
          network: 'ETC',
          providerStats: belowZeroMockProviderStatsState,
          workers: {},
        },
        0,
      );
      expect(() =>
        providerStatsReducer(undefined as any, belowZeroResponseTimeAction),
      ).toThrow('Provider mock1 has a response time of below 0');

      // handle non zero request failures
      const nonZeroMockProviderStatsState = {
        mock1: { ...mockProviderStats, workers: [], requestFailures: 1 },
        mock2: { ...mockProviderStats, workers: [] },
      };

      const nonZeroResponseTimeAction = balancerActions.balancerNetworkSwitchSucceeded(
        {
          network: 'ETC',
          providerStats: nonZeroMockProviderStatsState,
          workers: {},
        },
        0,
      );
      expect(() =>
        providerStatsReducer(undefined as any, nonZeroResponseTimeAction),
      ).toThrow('Provider mock1 has non-zero request failures');
    });
  });

  describe('Selector tests', () => {
    it('should properly filter online providers', () => {
      const selector = selectors.getOnlineProviders;
      const testState1 = {
        mock1: {
          avgResponseTime: 1,
          isOffline: false,
          currWorkersById: [],
          requestFailures: 0,
        },
        mock2: {
          avgResponseTime: 1,
          isOffline: true,
          currWorkersById: [],
          requestFailures: 0,
        },
      };
      const state = stateAssigner(testState1);
      expect(selector(state)).toEqual({
        mock1: {
          avgResponseTime: 1,
          isOffline: false,
          currWorkersById: [],
          requestFailures: 0,
        },
      });

      testState1.mock2.isOffline = false;

      expect(selector(state)).toEqual({
        mock1: {
          avgResponseTime: 1,
          isOffline: false,
          currWorkersById: [],
          requestFailures: 0,
        },
        mock2: {
          avgResponseTime: 1,
          isOffline: false,
          currWorkersById: [],
          requestFailures: 0,
        },
      });

      testState1.mock2.isOffline = true;
      testState1.mock1.isOffline = true;

      expect(selector(state)).toEqual({});
    });
  });
});
