import { callMeetsBalancerRetryThreshold } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import {
  IProviderCall,
  IProviderCallTimeout,
  PROVIDER_CALL,
  providerCallFailed,
  providerCallRequested,
} from '@src/ducks/providerBalancer/providerCalls';
import { providerOffline } from '@src/ducks/providerBalancer/providerStats';
import { providerExceedsRequestFailureThreshold } from '@src/ducks/selectors';
import { createRetryCall } from '@src/saga/sagaUtils';
import { put, select, takeEvery } from 'redux-saga/effects';

function* handleCallTimeouts(action: IProviderCallTimeout) {
  const {
    payload: { error, providerCall },
  } = action;
  const { providerId } = providerCall;

  const shouldSetProviderOffline: ReturnType<
    typeof providerExceedsRequestFailureThreshold
  > = yield select(providerExceedsRequestFailureThreshold, action);

  if (shouldSetProviderOffline) {
    yield put(providerOffline({ providerId }));
  }

  const callFailed: ReturnType<
    typeof callMeetsBalancerRetryThreshold
  > = yield select(callMeetsBalancerRetryThreshold, action);

  if (callFailed) {
    yield put(providerCallFailed({ error: error.message, providerCall }));
  } else {
    const nextProviderCall: IProviderCall = createRetryCall(providerCall);
    yield put(providerCallRequested(nextProviderCall));
  }
}

export const callTimeoutWatcher = [
  takeEvery(PROVIDER_CALL.TIMEOUT, handleCallTimeouts),
];
