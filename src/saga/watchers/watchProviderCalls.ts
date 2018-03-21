import { SagaIterator, buffers } from 'redux-saga';
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
} from '@src/ducks/providerBalancer/providerCalls';
import { BALANCER } from '@src/ducks/providerBalancer/balancerConfig';
import { isOffline } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { getAvailableProviderId } from '@src/ducks/selectors';
import { providerChannels } from '@src/saga/providerChannels';

function* handleRequest(): SagaIterator {
  const requestChan = yield actionChannel(
    PROVIDER_CALL.REQUESTED,
    buffers.expanding(50),
  );
  while (true) {
    function* process() {
      const { payload }: ProviderCallRequestedAction = yield take(requestChan);

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

      const providerChannel = providerChannels.getChannel(providerId);
      console.log(`Putting request to provider ${providerId}`);
      yield put(providerChannel, payload);
    }

    const { networkSwitched } = yield race({
      processed: call(process),
      networkSwitched: take(BALANCER.FLUSH),
    });

    if (networkSwitched) {
      console.log('flushed');
      yield flush(requestChan);
    }
    console.log('looping around');
  }
}

export const providerRequestWatcher = [fork(handleRequest)];
