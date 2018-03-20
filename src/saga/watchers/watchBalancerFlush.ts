import { SagaIterator } from 'redux-saga';
import { call, select, cancel, apply, takeEvery } from 'redux-saga/effects';
import { getWorkers, WorkerState } from '@src/ducks/providerBalancer/workers';
import { providerChannels } from '@src/saga/providerChannels';
import { BALANCER } from '@src/ducks/providerBalancer/balancerConfig';

function* clearChannels(): SagaIterator {
  yield apply(providerChannels, providerChannels.flushChannels);
  yield apply(providerChannels, providerChannels.deleteAllChannels);
}

function* clearWorkers(): SagaIterator {
  // cancel all existing workers
  const workers: WorkerState = yield select(getWorkers);
  for (const worker of Object.values(workers)) {
    yield cancel(worker.task);
  }
}

function* clearState(): SagaIterator {
  yield call(clearChannels);
  yield call(clearWorkers);
}

export const balancerFlushWatcher = [takeEvery(BALANCER.FLUSH, clearState)];
