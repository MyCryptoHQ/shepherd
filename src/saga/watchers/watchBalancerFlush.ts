import { SagaIterator } from 'redux-saga';
import {
  call,
  select,
  cancel,
  apply,
  takeEvery,
  put,
} from 'redux-saga/effects';
import { getWorkers, WorkerState } from '@src/ducks/providerBalancer/workers';
import { providerChannels } from '@src/saga/providerChannels';
import { BALANCER } from '@src/ducks/providerBalancer/balancerConfig';
import {
  providerCallFlushed,
  getAllPendingCalls,
  PendingProviderCall,
} from '@src/ducks/providerBalancer/providerCalls';

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

function* clearAllPendingCalls(): SagaIterator {
  const pendingCalls: PendingProviderCall[] = yield select(getAllPendingCalls);
  for (const call of pendingCalls) {
    const { pending, error, result, ...rest } = call;

    yield put(
      providerCallFlushed({ error: 'Call Flushed', providerCall: rest }),
    );
  }
}

function* clearState(): SagaIterator {
  yield call(clearChannels);
  yield call(clearWorkers);
  yield call(clearAllPendingCalls);
}

export const balancerFlushWatcher = [takeEvery(BALANCER.FLUSH, clearState)];
