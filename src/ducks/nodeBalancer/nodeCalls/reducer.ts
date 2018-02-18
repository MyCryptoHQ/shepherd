import {
  NodeCallsState,
  NodeCallRequestedAction,
  NodeCallSucceededAction,
  NodeCallFailedAction,
  NodeCallAction,
  NODE_CALL,
} from './types';

const handleNodeCallSucceeded = (
  state: NodeCallsState,
  { payload }: NodeCallSucceededAction,
): NodeCallsState => ({
  ...state,
  [payload.nodeCall.callId]: {
    ...payload.nodeCall,
    result: payload.result,
    error: null,
    pending: false,
  },
});

const handleNodeCallFailed = (
  state: NodeCallsState,
  { payload }: NodeCallFailedAction,
): NodeCallsState => ({
  ...state,
  [payload.nodeCall.callId]: {
    error: payload.error,
    ...payload.nodeCall,
    result: null,
    pending: false,
  },
});

const handleNodeCallPending = (
  state: NodeCallsState,
  { payload }: NodeCallRequestedAction,
): NodeCallsState => ({
  ...state,
  [payload.callId]: { ...payload, error: null, result: null, pending: true },
});

const INITIAL_STATE: NodeCallsState = {};

export const nodeCallsReducer = (
  state: NodeCallsState = INITIAL_STATE,
  action: NodeCallAction,
) => {
  switch (action.type) {
    case NODE_CALL.REQUESTED:
      return handleNodeCallPending(state, action);
    case NODE_CALL.SUCCEEDED:
      return handleNodeCallSucceeded(state, action);
    case NODE_CALL.FAILED:
      return handleNodeCallFailed(state, action);
    default:
      return state;
  }
};
