import {
  BALANCER,
  IBalancerAuto,
  IBalancerManualSucceeded,
  IBalancerNetworkSwitchRequested,
  IBalancerNetworkSwitchSucceeded,
  setOffline,
  setOnline,
} from '@src/ducks/providerBalancer/balancerConfig';
import { isOffline } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import {
  PROVIDER_STATS,
  ProviderStatsAction,
} from '@src/ducks/providerBalancer/providerStats';
import { getAllMethodsAvailable } from '@src/ducks/selectors';
import { buffers, SagaIterator } from 'redux-saga';
import {
  actionChannel,
  call,
  fork,
  put,
  select,
  take,
} from 'redux-saga/effects';

type WatchedActions =
  | ProviderStatsAction
  | IBalancerNetworkSwitchRequested
  | IBalancerNetworkSwitchSucceeded
  | IBalancerAuto
  | IBalancerManualSucceeded;

function* dispatchOffline() {
  const offline: ReturnType<typeof isOffline> = yield select(isOffline);
  if (!offline) {
    return yield put(setOffline());
  }
}

function* dispatchOnline() {
  const offline: ReturnType<typeof isOffline> = yield select(isOffline);
  const online = !offline;
  if (!online) {
    return yield put(setOnline());
  }
}

function* setBalancerOnlineState({ type }: WatchedActions): SagaIterator {
  if (type === BALANCER.NETWORK_SWTICH_REQUESTED) {
    yield call(dispatchOffline);
    //block until network switch is done
    return yield take(BALANCER.NETWORK_SWITCH_SUCCEEDED);
  }

  // check if all methods are available after this provider is online
  const isAllMethodsAvailable: ReturnType<
    typeof getAllMethodsAvailable
  > = yield select(getAllMethodsAvailable);

  // if they are, put app in online state
  if (isAllMethodsAvailable) {
    yield call(dispatchOnline);
  } else {
    yield call(dispatchOffline);
  }
}

function* handleBalancerHealth() {
  const chan = yield actionChannel(
    [
      PROVIDER_STATS.ONLINE,
      PROVIDER_STATS.OFFLINE,
      PROVIDER_STATS.ADDED,
      PROVIDER_STATS.REMOVED,
      BALANCER.NETWORK_SWITCH_SUCCEEDED,
      BALANCER.NETWORK_SWTICH_REQUESTED,
      BALANCER.AUTO,
      BALANCER.MANUAL_SUCCEEDED,
    ],
    buffers.expanding(50),
  );
  while (true) {
    const action = yield take(chan);
    yield call(setBalancerOnlineState, action);
  }
}

export const balancerHealthWatcher = [fork(handleBalancerHealth)];
