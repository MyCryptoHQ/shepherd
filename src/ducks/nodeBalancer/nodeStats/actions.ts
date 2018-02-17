import {
  NODE,
  NodeOnlineAction,
  NodeOfflineAction,
  NodeAddedAction,
  NodeRemovedAction,
} from './types';

export const nodeOnline = (
  payload: NodeOnlineAction['payload'],
): NodeOnlineAction => ({
  type: NODE.ONLINE,
  payload,
});

export const nodeOffline = (
  payload: NodeOfflineAction['payload'],
): NodeOfflineAction => ({
  type: NODE.OFFLINE,
  payload,
});

export const nodeAdded = (
  payload: NodeAddedAction['payload'],
): NodeAddedAction => ({
  type: NODE.ADDED,
  payload,
});

export const nodeRemoved = (
  payload: NodeRemovedAction['payload'],
): NodeRemovedAction => ({
  type: NODE.REMOVED,
  payload,
});
