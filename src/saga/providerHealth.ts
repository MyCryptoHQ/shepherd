import {
  providerOnline,
  ProviderStatsOfflineAction,
  PROVIDER_STATS,
} from '@src/ducks/providerBalancer/providerStats';
import { call, select, put, apply, race, takeEvery } from 'redux-saga/effects';
import { delay, SagaIterator } from 'redux-saga';
import {
  setOnline,
  setOffline,
} from '@src/ducks/providerBalancer/balancerConfig';
import { providerStorage } from '@src/providers';
import { getAllMethodsAvailable } from '@src/ducks/selectors';
import { isOffline } from '@src/ducks/providerBalancer/balancerConfig/selectors';

/**
 * @description polls the offline state of a provider, then returns control to caller when it comes back online
 * @param {string} providerId
 */
export function* checkProviderConnectivity(
  providerId: string,
  poll: boolean = true,
) {
  const provider = providerStorage.getInstance(providerId);
  while (true) {
    try {
      console.log(`Polling ${providerId} to see if its online...`);
      const { lb } = yield race({
        lb: apply(provider, provider.getCurrentBlock),
        to: call(delay, 5000),
      });
      if (lb) {
        console.log(`${providerId} online!`);
        return true;
      }
    } catch (error) {
      console.info(error);
    }
    if (!poll) {
      return false;
    }
    console.log(`${providerId} still offline`);
    yield call(delay, 5000);
  }
}

export function* watchOfflineProvider({
  payload: { providerId },
}: ProviderStatsOfflineAction) {
  yield call(checkProviderConnectivity, providerId);
  yield put(providerOnline({ providerId }));
}

export const watchBalancerOnlineState = [
  takeEvery(
    [PROVIDER_STATS.ONLINE, PROVIDER_STATS.OFFLINE],
    setBalancerOnlineState,
  ),
];

export function* setBalancerOnlineState(): SagaIterator {
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
