import { INITIAL_ROOT_STATE } from '@src/ducks';
import * as workerActions from './actions';
import * as balancerActions from '../balancerConfig/actions';
import * as providerCallActions from '../providerCalls/actions';
import * as providerStatsActions from '../providerStats';
import * as selectors from './selectors';
import workerReducer from './reducer';
import { StrIdx } from '@src/types';
import { Task } from 'redux-saga';
import { mockCall } from '@src/ducks/providerBalancer/providerCalls/providerCalls.spec';
import { mockProviderStats } from '@src/ducks/providerBalancer/providerStats/providerStats.spec';

const states: StrIdx<any> = {};

const stateAssigner = (reducerResult: any) => {
  const stateCopy = { ...INITIAL_ROOT_STATE };
  stateCopy.providerBalancer.workers = reducerResult;
  return stateCopy;
};

describe('Worker tests', () => {
  describe('Selectors on initial state tests', () => {
    it('should select undefined on a non-existent worker id', () => {
      expect(selectors.getWorkerById(INITIAL_ROOT_STATE, 'worker1')).toEqual(
        undefined,
      );
    });
    it('should select an empty object', () => {
      expect(selectors.getWorkers(INITIAL_ROOT_STATE)).toEqual({});
    });
  });

  describe('Action/Selector tests', () => {
    it('should handle a worker being spawned', () => {
      const action = workerActions.workerSpawned({
        providerId: 'mock1',
        workerId: 'worker1',
        task: {} as Task,
      });
      const selector = selectors.getWorkerById;
      states.workerSpawned = workerReducer(undefined as any, action);
      const state = stateAssigner(states.workerSpawned);

      expect(selector(state, 'worker1')).toEqual({
        assignedProvider: 'mock1',
        task: {},
        currentPayload: null,
      });

      // handle already existing worker
      expect(() => workerReducer(states.workerSpawned, action)).toThrow(
        'Worker worker1 already exists',
      );
    });

    it('should handle a worker processing a payload', () => {
      const action = workerActions.workerProcessing({
        workerId: 'worker1',
        currentPayload: mockCall,
      });
      const selector = selectors.getWorkerById;
      states.workerProcessing = workerReducer(states.workerSpawned, action);
      const state = stateAssigner(states.workerProcessing);

      expect(selector(state, 'worker1')).toEqual({
        assignedProvider: 'mock1',
        task: {},
        currentPayload: mockCall,
      });

      // handle non-existing worker
      expect(() => workerReducer(undefined as any, action)).toThrow(
        'Worker worker1 does not exist',
      );

      // handle payload over ride
      expect(() => workerReducer(states.workerProcessing, action)).toThrow(
        'Worker worker1 is already processing a payload',
      );
    });

    it('should handle a worker being killed', () => {
      const action = workerActions.workerKilled({
        providerId: 'mock1',
        workerId: 'worker1',
        error: Error(),
      });
      const selector = selectors.getWorkerById;
      states.workerKilled = workerReducer(states.workerProcessing, action);
      const state = stateAssigner(states.workerKilled);

      expect(selector(state, 'worker1')).toEqual(undefined);

      // handle non-existing worker
      expect(() => workerReducer(undefined as any, action)).toThrow(
        'Worker worker1 does not exist',
      );
    });

    it('should handle a successful network switch', () => {
      const workers = {
        worker1: {
          assignedProvider: 'mock1',
          task: {} as Task,
          currentPayload: null,
        },
        worker2: {
          assignedProvider: 'mock1',
          task: {} as Task,
          currentPayload: null,
        },
      };
      const action = balancerActions.balancerNetworkSwitchSucceeded({
        network: 'ETC',
        providerStats: {},
        workers,
      });
      const selector = selectors.getWorkers;
      states.networkSwitchSucceeded = workerReducer(
        states.workerProcessing,
        action,
      );
      const state = stateAssigner(states.networkSwitchSucceeded);

      expect(selector(state)).toEqual(workers);

      // handle non-existing tasks
      const noTaskWorkers = {
        worker1: {
          assignedProvider: 'mock1',
          task: {} as Task,
          currentPayload: null,
        },
        worker2: {
          assignedProvider: 'mock1',
          task: (null as any) as Task,
          currentPayload: null,
        },
      };
      const noTaskAction = balancerActions.balancerNetworkSwitchSucceeded({
        network: 'ETC',
        providerStats: {},
        workers: noTaskWorkers,
      });

      expect(() => workerReducer(undefined as any, noTaskAction)).toThrow(
        'Worker worker2 has no saga task assigned',
      );

      // handle payload task
      const payloadWorkers = {
        worker1: {
          assignedProvider: 'mock1',
          task: {} as Task,
          currentPayload: mockCall,
        },
        worker2: {
          assignedProvider: 'mock1',
          task: {} as Task,
          currentPayload: null,
        },
      };

      const payloadAction = balancerActions.balancerNetworkSwitchSucceeded({
        network: 'ETC',
        providerStats: {},
        workers: payloadWorkers,
      });
      expect(() => workerReducer(undefined as any, payloadAction)).toThrow(
        'Worker worker1 should not have an existing payload',
      );
    });

    it('should handle a successful provider call', () => {
      const action = providerCallActions.providerCallSucceeded({
        result: 'yay',
        providerCall: mockCall,
      });
      const selector = selectors.getWorkerById;
      states.providerCallSucceeded = workerReducer(
        states.workerProcessing,
        action,
      );
      const state = stateAssigner(states.providerCallSucceeded);

      expect(selector(state, 'worker1')).toEqual({
        assignedProvider: 'mock1',
        task: {},
        currentPayload: null,
      });

      // handle no worker found
      expect(() => workerReducer(undefined as any, action)).toThrow(
        'Worker not found for a successful request',
      );
    });

    it('should handle a provider call timeout', () => {
      const action = providerCallActions.providerCallTimeout({
        error: Error('nay'),
        providerCall: mockCall,
        providerId: 'mock1',
      });
      const selector = selectors.getWorkerById;
      states.providerCallTimeout = workerReducer(
        states.workerProcessing,
        action,
      );
      const state = stateAssigner(states.providerCallTimeout);

      expect(selector(state, 'worker1')).toEqual({
        assignedProvider: 'mock1',
        task: {},
        currentPayload: null,
      });

      // handle no worker found
      expect(() => workerReducer(undefined as any, action)).toThrow(
        'Worker not found for a timed out request',
      );
    });

    it('should handle a provider being added', () => {
      const action = providerStatsActions.providerAdded({
        providerId: 'mock1',
        stats: mockProviderStats,
        workers: {
          worker1: {
            assignedProvider: 'mock1',
            task: {} as Task,
            currentPayload: null,
          },
        },
      });
      const selector = selectors.getWorkers;
      states.providerStatsAdded = workerReducer(undefined as any, action);

      const state = stateAssigner(states.providerStatsAdded);

      expect(selector(state)).toEqual({
        worker1: {
          assignedProvider: 'mock1',
          task: {} as Task,
          currentPayload: null,
        },
      });

      // handle duplicate  workers

      expect(() => workerReducer(states.providerStatsAdded, action)).toThrow(
        'Worker worker1 already exists',
      );
    });
  });
});
