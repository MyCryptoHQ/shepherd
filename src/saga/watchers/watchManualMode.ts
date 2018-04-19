import {
  BALANCER,
  balancerNetworkSwitchRequested,
  IBalancerManualRequested,
  setManualFailed,
  setManualSucceeded,
} from '@src/ducks/providerBalancer/balancerConfig';
import { getNetwork } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { getProviderConfigById } from '@src/ducks/providerConfigs';
import { AllActions } from '@src/ducks/types';
import { checkProviderConnectivity } from '@src/saga/helpers/connectivity';
import { logger } from '@src/utils/logging';
import { SagaIterator } from 'redux-saga';
import { call, put, select, take, takeEvery } from 'redux-saga/effects';

function* attemptManualMode(
  providerId: string,
  skipOfflineCheck: boolean,
): SagaIterator {
  const config: ReturnType<typeof getProviderConfigById> = yield select(
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

  const isOnline: boolean = yield call(checkProviderConnectivity, providerId);

  if (!isOnline && !skipOfflineCheck) {
    return yield put(
      setManualFailed({
        error: `${providerId} to manually set to is not online`,
      }),
    );
  }

  const network: ReturnType<typeof getNetwork> = yield select(getNetwork);

  if (config.network !== network) {
    logger.log(`Manually set provider ${providerId} has a different network
      (Provider network: ${config.network}, current network ${network}).
       Setting new network`);
    const requestAction = balancerNetworkSwitchRequested({
      network: config.network,
    });
    yield put(requestAction);
    yield take((action: AllActions) => {
      if (action.type === BALANCER.NETWORK_SWITCH_SUCCEEDED) {
        return action.meta.id === requestAction.meta.id;
      }
      return false;
    });
  }

  yield put(setManualSucceeded({ providerId }));
}

function* handleManualMode({
  payload: { providerId, skipOfflineCheck },
}: IBalancerManualRequested): SagaIterator {
  yield call(attemptManualMode, providerId, skipOfflineCheck);
}

export const manualModeWatcher = [
  takeEvery(BALANCER.MANUAL_REQUESTED, handleManualMode),
];
