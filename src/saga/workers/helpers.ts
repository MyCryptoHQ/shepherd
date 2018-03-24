import {
  getProviderCallById,
  ProviderCallRequestedAction,
  ProviderCallState,
  providerCallSucceeded,
  providerCallTimeout,
} from '@src/ducks/providerBalancer/providerCalls';
import { workerProcessing } from '@src/ducks/providerBalancer/workers';
import { getProviderInstAndTimeoutThreshold } from '@src/ducks/providerConfigs';
import { providerChannels } from '@src/saga/channels';
import { addProviderIdToCall, makeRetVal } from '@src/saga/sagaUtils';
import { IProvider } from '@src/types';
import { delay } from 'redux-saga';
import { apply, call, cancelled, put, race, select } from 'redux-saga/effects';

function* sendRequestToProvider(
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
      result: apply(provider, provider[rpcMethod], rpcArgs),
      timeout: call(delay, timeoutThreshold),
    });

    if (!result) {
      const error = Error(`Request timed out for ${providerId}`);
      return makeRetVal(error);
    }

    return makeRetVal(null, result);
  } catch (error) {
    return makeRetVal(error);
  }
}

function* callIsStale(callId: number) {
  const callState: ProviderCallState = yield select(
    getProviderCallById,
    callId,
  );

  if (!callState.pending) {
    return true;
  }
}

function* processRequest(providerId: string, workerId: string) {
  // take from the assigned action channel
  const { payload }: ProviderCallRequestedAction = yield apply(
    providerChannels,
    providerChannels.take,
    [providerId],
  );
  const { rpcArgs, rpcMethod } = payload;
  const callWithPid = addProviderIdToCall(payload, providerId);

  if (yield call(callIsStale, payload.callId)) {
    return providerChannels.done(providerId);
  }

  // after taking a request, declare processing state
  yield put(workerProcessing({ currentPayload: callWithPid, workerId }));

  const { result, error } = yield call(
    sendRequestToProvider,
    providerId,
    rpcMethod,
    rpcArgs,
  );

  providerChannels.done(providerId);

  if (yield call(callIsStale, payload.callId)) {
    return;
  }

  if (result) {
    const action = providerCallSucceeded({
      result,
      providerCall: callWithPid,
    });
    return yield put(action);
  } else {
    const action = providerCallTimeout({
      providerCall: callWithPid,
      error,
    });
    return yield put(action);
  }
}

function* processIncomingRequests(thisId: string, providerId: string) {
  while (true) {
    yield call(processRequest, providerId, thisId);
  }
}

export function* createWorker(thisId: string, providerId: string) {
  try {
    yield call(processIncomingRequests, thisId, providerId);
  } catch (e) {
    console.error(`${thisId} as errored with ${e.message}`);
  } finally {
    if (yield cancelled()) {
    }
  }
}
