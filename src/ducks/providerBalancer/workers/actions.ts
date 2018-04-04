import {
  IWorkerKilled,
  IWorkerProcessing,
  IWorkerSpawned,
  WORKER,
} from './types';

export const workerSpawned = (
  payload: IWorkerSpawned['payload'],
): IWorkerSpawned => ({
  type: WORKER.SPAWNED,
  payload,
});

export const workerProcessing = (
  payload: IWorkerProcessing['payload'],
): IWorkerProcessing => ({
  type: WORKER.PROCESSING,
  payload,
});

export const workerKilled = (
  payload: IWorkerKilled['payload'],
): IWorkerKilled => ({
  type: WORKER.KILLED,
  payload,
});
