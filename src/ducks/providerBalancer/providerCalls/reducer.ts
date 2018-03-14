import {
  ProviderCallsState,
  ProviderCallRequestedAction,
  ProviderCallSucceededAction,
  ProviderCallFailedAction,
  ProviderCallAction,
  PROVIDER_CALL,
} from './types';

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

const handleProviderCallPending = (
  state: ProviderCallsState,
  { payload }: ProviderCallRequestedAction,
): ProviderCallsState => {
  const call = state[payload.callId];
  if (call) {
    throw Error('Provider call already exists');
  }
  return {
    ...state,
    [payload.callId]: { ...payload, error: null, result: null, pending: true },
  };
};

const INITIAL_STATE: ProviderCallsState = {};

export const providerCallsReducer = (
  state: ProviderCallsState = INITIAL_STATE,
  action: ProviderCallAction,
) => {
  switch (action.type) {
    case PROVIDER_CALL.REQUESTED:
      return handleProviderCallPending(state, action);
    case PROVIDER_CALL.SUCCEEDED:
      return handleProviderCallSucceeded(state, action);
    case PROVIDER_CALL.FAILED:
      return handleProviderCallFailed(state, action);
    default:
      return state;
  }
};
