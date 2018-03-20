import { SagaIterator } from 'redux-saga';
import { getAllMethodsAvailable } from '@src/ducks/selectors';
import { select, put, takeEvery } from 'redux-saga/effects';
import {
  setOnline,
  setOffline,
  BALANCER,
} from '@src/ducks/providerBalancer/balancerConfig';
import { isOffline } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { PROVIDER_STATS } from '@src/ducks/providerBalancer/providerStats';

function* setBalancerOnlineState(): SagaIterator {
  // check if all methods are available after this provider is online
  const isAllMethodsAvailable: boolean = yield select(getAllMethodsAvailable);

  // if they are, put app in online state
  if (isAllMethodsAvailable) {
    return yield put(setOnline());
  }

  const offline: boolean = yield select(isOffline);
  if (!offline) {
    return yield put(setOffline());
  }
}

export const balancerHealthWatcher = [
  takeEvery(
    [
      PROVIDER_STATS.ONLINE,
      PROVIDER_STATS.OFFLINE,
      PROVIDER_STATS.ADDED,
      PROVIDER_STATS.REMOVED,
      BALANCER.NETWORK_SWITCH_SUCCEEDED,
    ],
    setBalancerOnlineState,
  ),
];
