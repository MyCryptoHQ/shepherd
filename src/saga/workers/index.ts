import { IWorker } from '@src/ducks/providerBalancer/workers';
import { providerChannels } from '@src/saga/channels';
import { makeWorker, makeWorkerId } from '@src/saga/sagaUtils';
import { createWorker } from '@src/saga/workers/helpers';
import { StrIdx } from '@src/types';
import { Task } from 'redux-saga';
import { apply, spawn } from 'redux-saga/effects';

export function* spawnWorkers(
  providerId: string,
  currentWorkers: string[],
  maxNumOfWorkers: number,
) {
  const providerChannel = yield apply(
    providerChannels,
    providerChannels.createChannel,
    [providerId],
  );

  const workers: StrIdx<IWorker> = {};

  for (
    let workerNumber = currentWorkers.length;
    workerNumber < maxNumOfWorkers;
    workerNumber++
  ) {
    const workerId = makeWorkerId(providerId, workerNumber);
    const workerTask: Task = yield spawn(
      createWorker,
      workerId,
      providerId,
      providerChannel,
    );

    workers[workerId] = makeWorker(providerId, workerTask);
  }

  return { workers, workerIds: [...currentWorkers, ...Object.keys(workers)] };
}
