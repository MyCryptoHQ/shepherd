import { ProviderCallWithPid } from '@src/ducks/providerBalancer/providerCalls';
import { asyncTimeout, makeMockCall } from '@test/utils';
import { Task } from 'redux-saga';
import {
  addProviderIdToCall,
  createRetryCall,
  makeProviderStats,
  makeRetVal,
  makeWorker,
  makeWorkerId,
  trackTime,
} from './sagaUtils';

describe('Saga utils tests', () => {
  describe('trackTime tests', () => {
    it('should track one second', async () => {
      const timer = trackTime();
      await asyncTimeout(1000);
      const time = timer.end();
      expect(time).toBeGreaterThanOrEqual(900);
    });
  });
  describe('createRetryCall', () => {
    it('should create another provider call with the previous provider on the minimum priority list, and the number of retries increased by one', () => {
      const call: ProviderCallWithPid = makeMockCall({
        providerId: 'mock1',
        minPriorityProviderList: ['mock2'],
      }) as ProviderCallWithPid;
      const expectedCall = JSON.parse(JSON.stringify(call));
      expectedCall.minPriorityProviderList.push('mock1');
      expectedCall.numOfRetries = 1;
      expect(createRetryCall(call)).toEqual(expectedCall);
    });
    it('should not have duplicates in the minPriorityList', () => {
      const call: ProviderCallWithPid = makeMockCall({
        providerId: 'mock1',
        minPriorityProviderList: ['mock1'],
      }) as ProviderCallWithPid;
      const expectedCall = JSON.parse(JSON.stringify(call));
      expectedCall.numOfRetries = 1;
      expect(createRetryCall(call)).toEqual(expectedCall);
    });
  });
  describe('addProviderIdToCall', () => {
    it('should add a providerId to a call', () => {
      const call = makeMockCall();
      call.providerId = undefined;
      const providerId = 'mock1';
      expect(addProviderIdToCall(call, providerId)).toEqual({
        ...call,
        providerId: 'mock1',
      });
    });
  });

  describe('makeProviderStats', () => {
    it('should create provider statistics based on average response time and online status', async () => {
      const timer = trackTime();
      await asyncTimeout(1000);
      const offline = true;
      const stats = makeProviderStats(timer, offline);
      expect(stats.avgResponseTime).toBeGreaterThanOrEqual(900);
      expect(stats.isOffline).toEqual(true);
      expect(stats.currWorkersById).toEqual([]);
      expect(stats.requestFailures).toEqual(0);
    });
  });

  describe('makeWorkerId', () => {
    it('should make a workerId', () => {
      const id = makeWorkerId('mock1', 1);
      expect(id).toEqual('mock1_worker_1');
    });
  });

  describe('makeWorker', () => {
    it('should make a worker instance', () => {
      const worker = makeWorker('mock1', {} as Task);
      expect(worker).toEqual({
        assignedProvider: 'mock1',
        currentPayload: null,
        task: {},
      });
    });
  });

  describe('makeRetVal', () => {
    it('should make a return value with an error', () => {
      const error = Error('return error');
      const retVal = makeRetVal(error);
      expect(retVal).toEqual({ error, result: null });
    });
    it('should make a return value with a result', () => {
      const result = 'hi';
      const retVal = makeRetVal(null, result);
      expect(retVal).toEqual({ error: null, result });
    });
  });
});
