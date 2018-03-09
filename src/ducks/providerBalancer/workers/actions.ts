import {
  WORKER,
  WorkerSpawnedAction,
  WorkerProcessingAction,
  WorkerKilledAction,
} from './types';

export const workerSpawned = (
  payload: WorkerSpawnedAction['payload'],
): WorkerSpawnedAction => ({
  type: WORKER.SPAWNED,
  payload,
});

export const workerProcessing = (
  payload: WorkerProcessingAction['payload'],
): WorkerProcessingAction => ({
  type: WORKER.PROCESSING,
  payload,
});

export const workerKilled = (
  payload: WorkerKilledAction['payload'],
): WorkerKilledAction => ({
  type: WORKER.KILLED,
  payload,
});
