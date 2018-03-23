import { SagaIterator, buffers, delay, Channel } from 'redux-saga';
import {
  put,
  take,
  select,
  actionChannel,
  fork,
  call,
  race,
  flush,
} from 'redux-saga/effects';
import {
  ProviderCallRequestedAction,
  PROVIDER_CALL,
  providerCallFailed,
  IProviderCall,
} from '@src/ducks/providerBalancer/providerCalls';
import {
  BALANCER,
  balancerFlush,
} from '@src/ducks/providerBalancer/balancerConfig';
import { isOffline } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { getAvailableProviderId } from '@src/ducks/selectors';
import { providerChannels } from '@src/saga/providerChannels';

function* getOptimalProviderChannel(
  payload: ProviderCallRequestedAction['payload'],
): SagaIterator {
  // check if the app is offline
  if (yield select(isOffline)) {
    console.log('waiting for online');
    yield take(BALANCER.ONLINE); // wait until its back online
    console.log('online');
  }

  // get an available providerId to put the action to the channel
  const providerId: string | null = yield select(
    getAvailableProviderId,
    payload,
  );

  if (!providerId) {
    // TODO: seperate this into a different action
    yield put(
      providerCallFailed({
        providerCall: { ...payload, providerId: 'SHEPHERD' },
        error: 'No available provider found',
      }),
    );
    return undefined;
  }

  const providerChannel = providerChannels.getChannel(providerId);
  console.log(`Putting request to provider ${providerId}`);

  return providerChannel;
}

function* handleRequest(): SagaIterator {
  const requestChan = yield actionChannel(
    PROVIDER_CALL.REQUESTED,
    buffers.expanding(50),
  );
  while (true) {
    function* process() {
      const { payload }: ProviderCallRequestedAction = yield take(requestChan);
      const providerChannel: Channel<IProviderCall> | undefined = yield call(
        getOptimalProviderChannel,
        payload,
      );

      if (!providerChannel) {
        return;
      }
      yield put(providerChannel, payload);
    }

    const { networkSwitched, queueTimeout } = yield race({
      processed: call(process),
      networkSwitched: take(BALANCER.FLUSH),
      queueTimeout: call(delay, 5000),
    });

    if (networkSwitched || queueTimeout) {
      console.log('flushed');
      if (queueTimeout) {
        yield put(balancerFlush());
      }
      yield flush(requestChan);
    }
  }
}

export const providerRequestWatcher = [fork(handleRequest)];
