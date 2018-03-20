import { providerOffline } from '@src/ducks/providerBalancer/providerStats';
import { put, select, takeEvery } from 'redux-saga/effects';
import {
  IProviderCall,
  ProviderCallTimeoutAction,
  providerCallFailed,
  providerCallRequested,
  PROVIDER_CALL,
} from '@src/ducks/providerBalancer/providerCalls';
import { createRetryCall } from '@src/saga/sagaUtils';
import { providerExceedsRequestFailureThreshold } from '@src/ducks/selectors';
import { callMeetsBalancerRetryThreshold } from '@src/ducks/providerBalancer/balancerConfig/selectors';

function* handleCallTimeouts(action: ProviderCallTimeoutAction) {
  const { payload: { error, providerCall } } = action;
  const { providerId } = providerCall;

  const shouldSetProviderOffline: boolean = yield select(
    providerExceedsRequestFailureThreshold,
    action,
  );

  if (shouldSetProviderOffline) {
    yield put(providerOffline({ providerId }));
  }

  const callFailed: boolean = yield select(
    callMeetsBalancerRetryThreshold,
    action,
  );

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
