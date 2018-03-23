import { providerChannels } from '@src/saga/channels';
import { Workers } from '@src/saga/types';
import { makeWorkerId, makeWorker } from '@src/saga/sagaUtils';
import { Task } from 'redux-saga';
import { spawn, apply } from 'redux-saga/effects';
import { createWorker } from '@src/saga/workers/helpers';

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
