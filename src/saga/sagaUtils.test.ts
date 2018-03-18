import {
  trackTime,
  createRetryCall,
  addProviderIdToCall,
  makeWorkerId,
  makeWorker,
  makeRetVal,
} from './sagaUtils';
import { promisify } from 'util';
import { setTimeout } from 'timers';
import { makeMockCall } from '@test/utils';
import { ProviderCallWithPid } from '@src/ducks/providerBalancer/providerCalls';
import { Task } from 'redux-saga';
describe('Saga utils tests', () => {
  describe('trackTime tests', () => {
    const setTimeoutAsync = promisify(setTimeout);
    it('should track one second', async () => {
      const timer = trackTime();
      await setTimeoutAsync(1000);
      const time = timer.end();
      expect(time).toBeGreaterThanOrEqual(1000);
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
    it('should not have duplcates in the minPriorityList', () => {
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

  describe('makeProviderStats', () => {});

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

  describe('reducerProcessedProviders', () => {});

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
