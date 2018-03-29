import { SagaIterator } from 'redux-saga';
import {
  getProviderConfigById,
  IProviderConfig,
} from '@src/ducks/providerConfigs';
import { getNetwork } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import {
  takeEvery,
  select,
  put,
  call,
  cancelled,
  race,
  take,
} from 'redux-saga/effects';
import {
  BALANCER,
  BalancerManualRequestedAction,
  setManualFailed,
  setManualSucceeded,
} from '@src/ducks/providerBalancer/balancerConfig';
import { checkProviderConnectivity } from '@src/saga/helpers/connectivity';

function* attemptManualMode(providerId: string): SagaIterator {
  try {
    const config: IProviderConfig | undefined = yield select(
      getProviderConfigById,
      providerId,
    );
    if (!config) {
      return yield put(setManualFailed());
    }
    const network: string = yield select(getNetwork);
    if (config.network !== network) {
      return yield put(setManualFailed());
    }
    const isOnline = yield call(checkProviderConnectivity, providerId);

    if (!isOnline) {
      return yield put(setManualFailed());
    }

    yield put(setManualSucceeded({ providerId }));
  } finally {
    if (yield cancelled()) {
      return yield put(setManualFailed());
    }
  }
}

function* handleManualMode({
  payload: { providerId },
}: BalancerManualRequestedAction): SagaIterator {
  yield race({
    manualMode: call(attemptManualMode, providerId),
    networkSwtich: take(BALANCER.NETWORK_SWTICH_REQUESTED),
  });
}

export const manualModeWatcher = [
  takeEvery(BALANCER.MANUAL_REQUESTED, handleManualMode),
];
