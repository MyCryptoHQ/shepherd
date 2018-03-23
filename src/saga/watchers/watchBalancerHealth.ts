import { SagaIterator } from 'redux-saga';
import { getAllMethodsAvailable } from '@src/ducks/selectors';
import { select, put, takeEvery, call } from 'redux-saga/effects';
import {
  setOnline,
  setOffline,
  BALANCER,
  BalancerNetworkSwitchRequestedAction,
  BalancerNetworkSwitchSucceededAction,
} from '@src/ducks/providerBalancer/balancerConfig';
import { isOffline } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import {
  PROVIDER_STATS,
  ProviderStatsAction,
} from '@src/ducks/providerBalancer/providerStats';

type WatchedActions =
  | ProviderStatsAction
  | BalancerNetworkSwitchRequestedAction
  | BalancerNetworkSwitchSucceededAction;

function* dispatchOffline() {
  const offline: boolean = yield select(isOffline);
  if (!offline) {
    return yield put(setOffline());
  }
}

function* dispatchOnline() {
  const offline: boolean = yield select(isOffline);
  const online = !offline;
  if (!online) {
    return yield put(setOnline());
  }
}

function* setBalancerOnlineState({ type }: WatchedActions): SagaIterator {
  if (type === BALANCER.NETWORK_SWTICH_REQUESTED) {
    return yield call(dispatchOffline);
  }

  // check if all methods are available after this provider is online
  const isAllMethodsAvailable: boolean = yield select(getAllMethodsAvailable);

  // if they are, put app in online state
  if (isAllMethodsAvailable) {
    yield call(dispatchOnline);
  } else {
    yield call(dispatchOffline);
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
      BALANCER.NETWORK_SWTICH_REQUESTED,
    ],
    setBalancerOnlineState,
  ),
];
