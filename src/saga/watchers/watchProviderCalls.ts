import {
  BALANCER,
  balancerQueueTimeout,
} from '@src/ducks/providerBalancer/balancerConfig';
import { isOffline } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import {
  IProviderCallRequested,
  providerCallFailed,
} from '@src/ducks/providerBalancer/providerCalls';
import { getAvailableProviderId } from '@src/ducks/selectors';
import { balancerChannel, providerChannels } from '@src/saga/channels';
import { delay, SagaIterator } from 'redux-saga';
import { apply, call, fork, put, race, select, take } from 'redux-saga/effects';

function* getOptimalProviderId(
  payload: IProviderCallRequested['payload'],
): SagaIterator {
  // check if the app is offline
  if (yield select(isOffline)) {
    yield take(BALANCER.ONLINE); // wait until its back online
  }

  // get an available providerId to put the action to the channel
  const providerId: string | null = yield select(
    getAvailableProviderId,
    payload,
  );

  if (!providerId) {
    // TODO: seperate this into a different action
    const action = providerCallFailed({
      providerCall: { ...payload, providerId: 'SHEPHERD' },
      error: 'No available provider found',
    });
    yield put(action);
    return undefined;
  }

  return providerId;
}

function* handleRequest(): SagaIterator {
  yield apply(balancerChannel, balancerChannel.init);

  while (true) {
    // test if this starts queue timeout
    const action: IProviderCallRequested = yield apply(
      balancerChannel,
      balancerChannel.take,
    );

    function* process() {
      if (!action) {
        return;
      }
      const { payload } = action;
      const providerId: string | undefined = yield call(
        getOptimalProviderId,
        payload,
      );

      if (providerId) {
        yield apply(providerChannels, providerChannels.put, [
          providerId,
          action,
        ]);
      }
    }

    const { queueTimeout } = yield race({
      processed: call(process),
      // we cancel in case of a balancer flush
      // so we dont put an action that's about to be flushed
      // to a worker
      networkSwitch: take(BALANCER.FLUSH),
      queueTimeout: call(delay, 5000),
    });

    if (queueTimeout) {
      console.error('Queue timeout');
      yield put(balancerQueueTimeout());
    }
  }
}

export const providerRequestWatcher = [fork(handleRequest)];
