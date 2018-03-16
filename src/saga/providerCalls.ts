import { SagaIterator, buffers } from 'redux-saga';
import { put, take, select, actionChannel } from 'redux-saga/effects';
import {
  IProviderCall,
  ProviderCallRequestedAction,
  ProviderCallTimeoutAction,
  providerCallFailed,
  providerCallRequested,
  PROVIDER_CALL,
} from '@src/ducks/providerBalancer/providerCalls';
import { BALANCER } from '@src/ducks/providerBalancer/balancerConfig';

import {
  isOffline,
  getProviderCallRetryThreshold,
} from '@src/ducks/providerBalancer/balancerConfig/selectors';

import { channels } from '@src/saga';

import { getAvailableProviderId } from '@src/ducks/selectors';

export function* handleProviderCallRequests(): SagaIterator {
  const requestChan = yield actionChannel(
    PROVIDER_CALL.REQUESTED,
    buffers.expanding(50),
  );
  while (true) {
    const { payload }: ProviderCallRequestedAction = yield take(requestChan);
    // check if the app is offline
    if (yield select(isOffline)) {
      yield take(BALANCER.ONLINE); // wait until its back online
    }

    // get an available providerId to put the action to the channel
    const providerId: string | null = yield select(
      getAvailableProviderId,
      payload,
    );

    const providerChannel = channels[providerId];
    yield put(providerChannel, payload);
  }
}
