import { BALANCER } from '@src/ducks/providerBalancer/balancerConfig';
import {
  getProviderStatsById,
  PROVIDER_STATS,
} from '@src/ducks/providerBalancer/providerStats';
import { checkProviderConnectivity } from '@src/saga/helpers/connectivity';
import { delay, SagaIterator } from 'redux-saga';
import { call, select, take } from 'redux-saga/effects';

export function* pollProviderUntilConnected(providerId: string): SagaIterator {
  while (true) {
    yield call(delay, 5000);

    const connected: boolean = yield call(
      checkProviderConnectivity,
      providerId,
    );
    if (connected) {
      return true;
    }
  }
}

/**
 * @description waits for any action that adds to the provider stats reducer,
 * and only returns when the specified provider exists
 * @param providerId
 */
export function* waitForProviderStatsToExist(providerId: string) {
  while (true) {
    const stats: ReturnType<typeof getProviderStatsById> = yield select(
      getProviderStatsById,
      providerId,
    );
    if (stats) {
      return true;
    }
    yield take([BALANCER.NETWORK_SWITCH_SUCCEEDED, PROVIDER_STATS.ADDED]);
  }
}
