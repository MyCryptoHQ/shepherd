import { SagaIterator, buffers } from 'redux-saga';
import { put, take, select, actionChannel } from 'redux-saga/effects';
import {
  ProviderCall,
  ProviderCallRequestedAction,
  ProviderCallTimeoutAction,
  providerCallFailed,
  providerCallRequested,
  PROVIDER_CALL,
} from '@src/ducks/providerBalancer/providerCalls';
import {
  BALANCER,
  setOffline,
} from '@src/ducks/providerBalancer/balancerConfig';
import {
  IProviderStats,
  providerOffline,
  getProviderStatsById,
} from '@src/ducks/providerBalancer/providerStats';
import {
  isOffline,
  getProviderCallRetryThreshold,
} from '@src/ducks/providerBalancer/balancerConfig/selectors';
import {
  getAvailableProviderId,
  getAllMethodsAvailable,
} from '@src/ducks/providerBalancer/selectors';
import { channels } from '@src/saga';
import {
  IProviderConfig,
  getProviderConfigById,
} from '@src/ducks/providerConfigs/configs';

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

export function* handleCallTimeouts({
  payload: { error, providerId, ...providerCall },
}: ProviderCallTimeoutAction): SagaIterator {
  const providerStats: Readonly<IProviderStats> | undefined = yield select(
    getProviderStatsById,
    providerId,
  );
  const providerConfig: IProviderConfig | undefined = yield select(
    getProviderConfigById,
    providerId,
  );

  if (!providerStats || !providerConfig) {
    throw Error('Could not find provider stats or config');
  }
  // if the provider has reached maximum failures, declare it as offline
  if (providerStats.requestFailures >= providerConfig.requestFailureThreshold) {
    yield put(providerOffline({ providerId }));

    //check if all methods are still available after this provider goes down
    const isAllMethodsAvailable: boolean = yield select(getAllMethodsAvailable);
    if (!isAllMethodsAvailable) {
      // if not, set app state offline and flush channels

      yield put(setOffline());
    }
  }

  const providerCallRetryThreshold = yield select(
    getProviderCallRetryThreshold,
  );

  // if the payload exceeds timeout limits, return a response failure
  if (providerCall.numOfTimeouts > providerCallRetryThreshold) {
    yield put(providerCallFailed({ error: error.message, providerCall }));
  } else {
    // else consider it a timeout on the request to be retried
    // might want to make this a seperate action
    // add providerId to min priority to avoid it if possible
    const nextProviderCall: ProviderCall = {
      ...providerCall,
      minPriorityProviderList: [
        ...providerCall.minPriorityProviderList,
        providerId,
      ],
      numOfTimeouts: ++providerCall.numOfTimeouts,
    };
    yield put(providerCallRequested(nextProviderCall));
  }
}
