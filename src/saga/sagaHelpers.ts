import { providerOffline } from '@src/ducks/providerBalancer/providerStats';
import { getProviderInstAndTimeoutThreshold } from '@src/ducks/providerConfigs';
import { put, select, takeEvery, call, apply, race } from 'redux-saga/effects';
import {
  IProviderCall,
  ProviderCallTimeoutAction,
  providerCallFailed,
  providerCallRequested,
  PROVIDER_CALL,
} from '@src/ducks/providerBalancer/providerCalls';
import {
  createRetryCall,
  createInternalError,
  makeRetVal,
} from '@src/saga/sagaUtils';
import { providerExceedsRequestFailureThreshold } from '@src/ducks/selectors';
import { callExceedsBalancerRetryThreshold } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { IProvider } from '@src/types';
import { delay, Channel, buffers, channel, SagaIterator } from 'redux-saga';
import { channels } from '@src/saga';

export function* addProviderChannel(providerId: string): SagaIterator {
  const providerChannel: Channel<IProviderCall> = yield call(
    channel,
    buffers.expanding(10),
  );

  channels[providerId] = providerChannel;

  return providerChannel;
}

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
    callExceedsBalancerRetryThreshold,
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

export function* sendRequestToProvider(
  providerId: string,
  rpcMethod: keyof IProvider,
  rpcArgs: any,
) {
  try {
    const { provider, timeoutThreshold } = yield select(
      getProviderInstAndTimeoutThreshold,
      providerId,
    );

    // make the call in the allotted timeout time
    const { result } = yield race({
      result: apply(provider, provider[rpcMethod] as any, rpcArgs),
      timeout: call(delay, timeoutThreshold),
    });

    if (!result) {
      const error = createInternalError(`Request timed out for ${providerId}`);
      return makeRetVal(error);
    }

    return makeRetVal(null, result);
  } catch (error) {
    error.name += 'NetworkError_';
    return makeRetVal(error);
  }
}
