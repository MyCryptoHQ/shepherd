import { AllNodeIds, NodeCall } from '../nodeCalls/types';
import { Task } from 'redux-saga';

export interface IWorker {
  task: Task;
  assignedNode: AllNodeIds;
  currentPayload: NodeCall | null;
}

export interface WorkerState {
  [workerId: string]: Readonly<IWorker>;
}

export enum WORKER {
  PROCESSING = 'WORKER_PROCESSING',
  SPAWNED = 'WORKER_SPAWNED',
  KILLED = 'WORKER_KILLED',
}

export interface WorkerSpawnedAction {
  type: WORKER.SPAWNED;
  payload: {
    nodeId: AllNodeIds;
    workerId: string;
    task: Task;
  };
}

export interface WorkerProcessingAction {
  type: WORKER.PROCESSING;
  payload: {
    workerId: string;
    currentPayload: NodeCall;
  };
}

export interface WorkerKilledAction {
  type: WORKER.KILLED;
  payload: {
    nodeId: AllNodeIds;
    workerId: string;
    error: Error;
  };
}

export type WorkerAction =
  | WorkerSpawnedAction
  | WorkerProcessingAction
  | WorkerKilledAction;
