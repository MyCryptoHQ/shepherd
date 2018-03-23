import { BALANCER } from '@src/ducks/providerBalancer/balancerConfig';
import {
  PROVIDER_STATS,
  providerOnline,
  ProviderStatsOfflineAction,
} from '@src/ducks/providerBalancer/providerStats';
import { call, put, race, take, takeEvery } from 'redux-saga/effects';
import {
  pollProviderUntilConnected,
  waitForProviderStatsToExist,
} from './helpers';

function* watchOfflineProvider({
  payload: { providerId },
}: ProviderStatsOfflineAction) {
  yield call(pollProviderUntilConnected, providerId);
  // handles failure case of:
  // network switch requested
  // provider isnt online so this fires
  // provider is online before network switch is successful
  // this puts an action to a non existent provider id
  yield call(waitForProviderStatsToExist, providerId);
  yield put(providerOnline({ providerId }));
  return true;
}

function* handleWatching(action: ProviderStatsOfflineAction) {
  yield race({
    online: call(watchOfflineProvider, action),
    networkSwitched: take(BALANCER.NETWORK_SWTICH_REQUESTED),
  });
}

export const providerHealthWatcher = [
  takeEvery(PROVIDER_STATS.OFFLINE, handleWatching),
];
