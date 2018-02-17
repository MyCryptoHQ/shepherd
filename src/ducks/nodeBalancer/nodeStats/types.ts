import { AllNodeIds } from '../nodeCalls/types';
import RpcNode from '@src/nodes/rpc';

export interface INodeStats {
  isCustom: boolean;
  maxWorkers: number;
  currWorkersById: string[];
  timeoutThresholdMs: number;
  isOffline: boolean;
  requestFailures: number;
  requestFailureThreshold: number;
  avgResponseTime: number;
  supportedMethods: { [rpcMethod in keyof RpcNode]: boolean };
}

export interface NodeStatsState {
  [nodeId: string]: Readonly<INodeStats>;
}

export enum NODE {
  ONLINE = 'NODE_ONLINE',
  OFFLINE = 'NODE_OFFLINE',
  ADDED = 'NODE_ADDED',
  REMOVED = 'NODE_REMOVED',
}

export interface NodeOnlineAction {
  type: NODE.ONLINE;
  payload: {
    nodeId: AllNodeIds;
  };
}

export interface NodeOfflineAction {
  type: NODE.OFFLINE;
  payload: {
    nodeId: AllNodeIds;
  };
}

export interface NodeAddedAction {
  type: NODE.ADDED;
  payload: {
    nodeId: AllNodeIds;
  } & INodeStats;
}

export interface NodeRemovedAction {
  type: NODE.REMOVED;
  payload: { nodeId: AllNodeIds };
}

export type NodeAction =
  | NodeOnlineAction
  | NodeOfflineAction
  | NodeAddedAction
  | NodeRemovedAction;
