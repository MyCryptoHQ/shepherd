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
import { providerChannels, balancerChannel } from '@src/saga/channels';
import {
  BALANCER,
  balancerFlush,
  BalancerQueueTimeoutAction,
  BalancerNetworkSwitchRequestedAction,
} from '@src/ducks/providerBalancer/balancerConfig';

function* clearWorkers(): SagaIterator {
  const workers: WorkerState = yield select(getWorkers);
  for (const worker of Object.values(workers)) {
    yield cancel(worker.task);
  }
}

function* clearAllPendingCalls(): SagaIterator {
  yield apply(providerChannels, providerChannels.cancelPendingCalls);
  yield apply(balancerChannel, balancerChannel.cancelPendingCalls);
}

function* deleteProviderChannels() {
  yield apply(providerChannels, providerChannels.deleteAllChannels);
}

type FlushingActions =
  | BalancerQueueTimeoutAction
  | BalancerNetworkSwitchRequestedAction;

function* clearState({ type }: FlushingActions): SagaIterator {
  const isNetworkSwitch = type === BALANCER.NETWORK_SWTICH_REQUESTED;
  yield call(clearAllPendingCalls);

  if (isNetworkSwitch) {
    yield put(balancerFlush());
    yield call(clearWorkers);
    yield call(deleteProviderChannels);
  }
}

export const balancerFlushWatcher = [
  takeEvery(
    [BALANCER.NETWORK_SWTICH_REQUESTED, BALANCER.QUEUE_TIMEOUT],
    clearState,
  ),
];
