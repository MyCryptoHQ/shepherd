import {
  IProviderStats,
  providerOffline,
  getProviderStatsById,
} from '@src/ducks/providerBalancer/providerStats';
import {
  IProviderConfig,
  getProviderConfigById,
} from '@src/ducks/providerConfigs';
import { put, select, takeEvery, call } from 'redux-saga/effects';
import {
  IProviderCall,
  ProviderCallTimeoutAction,
  providerCallFailed,
  providerCallRequested,
  PROVIDER_CALL,
} from '@src/ducks/providerBalancer/providerCalls';
import { getProviderCallRetryThreshold } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { createRetryCall } from '@src/saga/sagaUtils';

function* providerExceedsRequestFailureThreshold({
  payload: { providerId },
}: ProviderCallTimeoutAction) {
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
    return true;
  }

  return false;
}

function* callExceedsBalancerRetryThreshold({
  payload: { providerCall },
}: ProviderCallTimeoutAction) {
  const providerCallRetryThreshold = yield select(
    getProviderCallRetryThreshold,
  );

  // checks the current call to see if it has failed more than the configured number
  if (providerCall.numOfRetries > providerCallRetryThreshold) {
    return true;
  }

  return false;
}

function* handleCallTimeouts(action: ProviderCallTimeoutAction) {
  const { payload: { error, providerCall, providerId } } = action;

  const shouldSetProviderOffline: boolean = yield call(
    providerExceedsRequestFailureThreshold,
    action,
  );
  if (shouldSetProviderOffline) {
    yield put(providerOffline({ providerId }));
  }

  const callFailed: boolean = yield call(
    callExceedsBalancerRetryThreshold,
    action,
  );

  if (callFailed) {
    yield put(providerCallFailed({ error: error.message, providerCall }));
  } else {
    const nextProviderCall: IProviderCall = createRetryCall(
      providerCall,
      providerId,
    );
    yield put(providerCallRequested(nextProviderCall));
  }
}

export const callTimeoutWatcher = [
  takeEvery(PROVIDER_CALL.TIMEOUT, handleCallTimeouts),
];
