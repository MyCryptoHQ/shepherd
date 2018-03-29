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
  balancerNetworkSwitchRequested,
} from '@src/ducks/providerBalancer/balancerConfig';
import { checkProviderConnectivity } from '@src/saga/helpers/connectivity';
import { logger } from '@src/utils/logging';

function* attemptManualMode(
  providerId: string,
  skipOfflineCheck: boolean,
): SagaIterator {
  const config: IProviderConfig | undefined = yield select(
    getProviderConfigById,
    providerId,
  );
  if (!config) {
    return yield put(
      setManualFailed({
        error: `Provider config for ${providerId} not found`,
      }),
    );
  }

  const isOnline = yield call(checkProviderConnectivity, providerId);

  if (!isOnline && !skipOfflineCheck) {
    return yield put(
      setManualFailed({
        error: `${providerId} to manually set to is not online`,
      }),
    );
  }

  const network: string = yield select(getNetwork);
  if (config.network !== network) {
    logger.log(`Manually set provider ${providerId} has a different network 
      (Provider network: ${config.network}, current network ${network}).
       Setting new network`);
    yield put(balancerNetworkSwitchRequested({ network: config.network }));
    yield take(BALANCER.NETWORK_SWITCH_SUCCEEDED);
  }

  yield put(setManualSucceeded({ providerId }));
}

function* handleManualMode({
  payload: { providerId, skipOfflineCheck },
}: BalancerManualRequestedAction): SagaIterator {
  yield call(attemptManualMode, providerId, skipOfflineCheck);
}

export const manualModeWatcher = [
  takeEvery(BALANCER.MANUAL_REQUESTED, handleManualMode),
];
