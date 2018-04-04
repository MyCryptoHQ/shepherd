import { IProviderCallFlushed } from '@src/ducks/providerBalancer/providerCalls';
import {
  IWorkerProcessing,
  WORKER,
  WorkerAction,
} from '@src/ducks/providerBalancer/workers';
import {
  IProviderCallFailed,
  IProviderCallRequested,
  IProviderCallSucceeded,
  PROVIDER_CALL,
  ProviderCallAction,
  ProviderCallsState,
} from './types';

const handleProviderCallSucceeded = (
  state: ProviderCallsState,
  { payload }: IProviderCallSucceeded,
): ProviderCallsState => {
  const call = state[payload.providerCall.callId];
  if (!call || !call.pending) {
    throw Error(`Pending provider call not found ${call ? call.callId : ''}`);
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
  { payload }: IProviderCallFailed,
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
  { payload }: IProviderCallFlushed,
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
  { payload }: IProviderCallRequested,
): ProviderCallsState => {
  const call = state[payload.callId];

  // a duplicate check that makes sure the incoming call is either new or a retry call
  if (call && call.numOfRetries === payload.numOfRetries) {
    throw Error('Provider call already exists');
  }
  return {
    ...state,
    [payload.callId]: { ...payload, error: null, result: null, pending: true },
  };
};

const handleWorkerProcessing = (
  state: ProviderCallsState,
  { payload: { currentPayload } }: IWorkerProcessing,
) => {
  const prevPayload = state[currentPayload.callId];
  if (!prevPayload || !prevPayload.pending) {
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
