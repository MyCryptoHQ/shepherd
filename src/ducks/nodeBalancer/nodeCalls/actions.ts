import {
  NodeCallRequestedAction,
  NODE_CALL,
  NodeCallTimeoutAction,
  NodeCallFailedAction,
  NodeCallSucceededAction,
} from './types';

export const nodeCallRequested = (
  payload: NodeCallRequestedAction['payload'],
): NodeCallRequestedAction => ({
  type: NODE_CALL.REQUESTED,
  payload,
});

export const nodeCallTimeout = (
  payload: NodeCallTimeoutAction['payload'],
): NodeCallTimeoutAction => ({
  type: NODE_CALL.TIMEOUT,
  payload,
});

export const nodeCallFailed = (
  payload: NodeCallFailedAction['payload'],
): NodeCallFailedAction => ({
  type: NODE_CALL.FAILED,
  payload,
});

export const nodeCallSucceeded = (
  payload: NodeCallSucceededAction['payload'],
): NodeCallSucceededAction => ({
  type: NODE_CALL.SUCCEEDED,
  payload,
});
