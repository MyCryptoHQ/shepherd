import { StaticNodeId } from '@src/types/nodes';
import RpcNode from '@src/nodes/rpc';

export type AllNodeIds = StaticNodeId | string;

export interface NodeCallsState {
  [callId: string]: SuccessfulNodeCall | PendingNodeCall | FailedNodeCall;
}

export enum NODE_CALL {
  REQUESTED = 'NODE_CALL_REQUESTED',
  TIMEOUT = 'NODE_CALL_TIMEOUT',
  SUCCEEDED = 'NODE_CALL_SUCCEEDED',
  FAILED = 'NODE_CALL_FAILED',
}

export interface NodeCall {
  callId: number;
  rpcMethod: keyof RpcNode;
  rpcArgs: string[];
  numOfTimeouts: number;
  minPriorityNodeList: AllNodeIds[];
  nodeWhiteList?: AllNodeIds[];
  nodeId?: string;
}

export interface SuccessfulNodeCall extends NodeCall {
  result: string;
  error: null;
  pending: false;
}

export interface FailedNodeCall extends NodeCall {
  result: null;
  error: string;
  pending: false;
}

export interface PendingNodeCall extends NodeCall {
  result: null;
  error: null;
  pending: true;
}

export interface NodeCallRequestedAction {
  type: NODE_CALL.REQUESTED;
  payload: NodeCall;
}

export interface NodeCallTimeoutAction {
  type: NODE_CALL.TIMEOUT;
  payload: NodeCall & { nodeId: AllNodeIds; error: Error };
}

export interface NodeCallFailedAction {
  type: NODE_CALL.FAILED;
  payload: { error: string; nodeCall: NodeCall };
}

export interface NodeCallSucceededAction {
  type: NODE_CALL.SUCCEEDED;
  payload: { result: string; nodeCall: NodeCall };
}

export type NodeCallAction =
  | NodeCallRequestedAction
  | NodeCallTimeoutAction
  | NodeCallFailedAction
  | NodeCallSucceededAction;
