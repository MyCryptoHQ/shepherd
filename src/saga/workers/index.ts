import { providerChannels } from '@src/saga/channels';
import { makeWorker, makeWorkerId } from '@src/saga/sagaUtils';
import { Workers } from '@src/saga/types';
import { createWorker } from '@src/saga/workers/helpers';
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

  const workers: Workers = {};

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
