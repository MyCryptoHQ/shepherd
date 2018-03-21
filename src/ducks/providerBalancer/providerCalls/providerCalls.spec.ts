import { INITIAL_ROOT_STATE } from '@src/ducks';
import * as actions from './actions';
import * as selectors from './selectors';
import { providerCallsReducer } from './reducer';
import { StrIdx } from '@src/types';
import { ProviderCallWithPid } from '@src/ducks/providerBalancer/providerCalls';

const stateAssigner = (reducerResult: any) => {
  const stateCopy = JSON.parse(JSON.stringify(INITIAL_ROOT_STATE));
  stateCopy.providerBalancer.providerCalls = reducerResult;
  return stateCopy;
};

export const mockCall: ProviderCallWithPid = {
  callId: 0,
  minPriorityProviderList: [],
  numOfRetries: 0,
  providerId: 'mock1',
  providerWhiteList: [],
  rpcArgs: [],
  rpcMethod: 'ping',
};

const states: StrIdx<any> = {};

describe('Provider calls tests ', () => {
  describe('Selectors on initial state tests ', () => {
    it('should select 0 related calls when there is no matching provider id', () => {
      expect(
        selectors.getPendingProviderCallsByProviderId(INITIAL_ROOT_STATE, ''),
      ).toEqual(0);
    });

    it('should select undefined when selected by a non-existent call id', () => {
      expect(selectors.getProviderCallById(INITIAL_ROOT_STATE, 0)).toEqual(
        undefined,
      );
    });

    it('should select an empty object', () => {
      expect(selectors.getProviderCalls(INITIAL_ROOT_STATE)).toEqual({});
    });
  });
  describe('Action/Selector tests', () => {
    it('should store a pending call request', () => {
      const action = actions.providerCallRequested(mockCall);
      const selector1 = selectors.getPendingProviderCallsByProviderId;
      const selector2 = selectors.getProviderCallById;

      states.pendingCallRequest = providerCallsReducer(
        undefined as any,
        action,
      );
      const state = stateAssigner(states.pendingCallRequest);

      expect(selector1(state, 'mock1')).toEqual(1);
      expect(selector2(state, 0)).toEqual({
        ...mockCall,
        error: null,
        result: null,
        pending: true,
      });
    });

    it('should handle a successful call request', () => {
      const action = actions.providerCallSucceeded({
        result: 'Success',
        providerCall: { ...mockCall, providerId: 'mock1' },
      });
      const selector1 = selectors.getPendingProviderCallsByProviderId;
      const selector2 = selectors.getProviderCallById;

      states.success = stateAssigner(
        providerCallsReducer(states.pendingCallRequest, action),
      );

      expect(selector1(states.success, 'mock1')).toEqual(0);
      expect(selector2(states.success, 0)).toEqual({
        ...mockCall,
        error: null,
        result: 'Success',
        pending: false,
      });
    });

    it('should handle a failed call request', () => {
      const action = actions.providerCallFailed({
        error: 'failed',
        providerCall: mockCall,
      });
      const selector1 = selectors.getPendingProviderCallsByProviderId;
      const selector2 = selectors.getProviderCallById;
      const state = stateAssigner(
        providerCallsReducer(states.pendingCallRequest, action),
      );
      expect(selector1(state, 'mock1')).toEqual(0);
      expect(selector2(state, 0)).toEqual({
        ...mockCall,
        error: 'failed',
        result: null,
        pending: false,
      });
    });

    it('should throw on duplicate pending requests', () => {
      const action = actions.providerCallRequested(mockCall);
      expect(() =>
        providerCallsReducer(states.pendingCallRequest, action),
      ).toThrow();
    });

    it('should throw on invalid state (either failed or success calls on a non-pending request, or non existsing request)', () => {
      const failedAction = actions.providerCallFailed({
        error: 'failed',
        providerCall: mockCall,
      });

      const successAction = actions.providerCallSucceeded({
        result: 'Success',
        providerCall: mockCall,
      });
      expect(() =>
        providerCallsReducer(undefined as any, failedAction),
      ).toThrow();

      expect(() =>
        providerCallsReducer(undefined as any, successAction),
      ).toThrow();

      expect(() =>
        providerCallsReducer(states.success, failedAction),
      ).toThrow();

      expect(() =>
        providerCallsReducer(states.success, successAction),
      ).toThrow();
    });
  });
});
