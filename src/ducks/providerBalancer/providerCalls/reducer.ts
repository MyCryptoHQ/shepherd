import {
  ProviderCallsState,
  ProviderCallRequestedAction,
  ProviderCallSucceededAction,
  ProviderCallFailedAction,
  ProviderCallAction,
  PROVIDER_CALL,
} from './types';
import {
  WORKER,
  WorkerProcessingAction,
  WorkerAction,
} from '@src/ducks/providerBalancer/workers';
import { ProviderCallFlushedAction } from '@src/ducks/providerBalancer/providerCalls';

const handleProviderCallSucceeded = (
  state: ProviderCallsState,
  { payload }: ProviderCallSucceededAction,
): ProviderCallsState => {
  const call = state[payload.providerCall.callId];
  if (!call || !call.pending) {
    throw Error('Pending provider call not found');
  }

  return {
    ...state,
    [payload.providerCall.callId]: {
      ...payload.providerCall,
      result: payload.result,
      error: null,
      pending: false,
    },
  };
};

const handleProviderCallFailed = (
  state: ProviderCallsState,
  { payload }: ProviderCallFailedAction,
): ProviderCallsState => {
  const call = state[payload.providerCall.callId];
  if (!call || !call.pending) {
    throw Error('Pending provider call not found');
  }

  return {
    ...state,
    [payload.providerCall.callId]: {
      error: payload.error,
      ...payload.providerCall,
      result: null,
      pending: false,
    },
  };
};

const handleProviderCallFlushed = (
  state: ProviderCallsState,
  { payload }: ProviderCallFlushedAction,
): ProviderCallsState => {
  const call = state[payload.providerCall.callId];

  if (!call || !call.pending) {
    throw Error('Pending provider call not found');
  }

  return {
    ...state,
    [payload.providerCall.callId]: {
      error: payload.error,
      ...payload.providerCall,
      result: null,
      pending: false,
    },
  };
};

const handleProviderCallPending = (
  state: ProviderCallsState,
  { payload }: ProviderCallRequestedAction,
): ProviderCallsState => {
  const call = state[payload.callId];

  // a duplicate check that makes sure the incoming call is either new or a retry call
  if (call && call.numOfRetries === payload.numOfRetries) {
    console.error(call, payload);
    throw Error('Provider call already exists');
  }
  return {
    ...state,
    [payload.callId]: { ...payload, error: null, result: null, pending: true },
  };
};

const handleWorkerProcessing = (
  state: ProviderCallsState,
  { payload: { currentPayload } }: WorkerProcessingAction,
) => {
  const prevPayload = state[currentPayload.callId];
  if (!prevPayload || !prevPayload.pending) {
    console.error(currentPayload);
    throw Error('Pending provider call not found');
  }

  const nextPayload = { ...prevPayload, providerId: currentPayload.providerId };

  return {
    ...state,
    [currentPayload.callId]: nextPayload,
  };
};

const INITIAL_STATE: ProviderCallsState = {};

export const providerCallsReducer = (
  state: ProviderCallsState = INITIAL_STATE,
  action: ProviderCallAction | WorkerAction,
) => {
  switch (action.type) {
    case PROVIDER_CALL.REQUESTED:
      return handleProviderCallPending(state, action);
    case WORKER.PROCESSING:
      return handleWorkerProcessing(state, action);
    case PROVIDER_CALL.SUCCEEDED:
      return handleProviderCallSucceeded(state, action);
    case PROVIDER_CALL.FAILED:
      return handleProviderCallFailed(state, action);
    case PROVIDER_CALL.FLUSHED:
      return handleProviderCallFlushed(state, action);
    default:
      return state;
  }
};
