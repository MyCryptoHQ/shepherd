import {
  call,
  take,
  put,
  cancelled,
  select,
  race,
  apply,
} from 'redux-saga/effects';
import {
  IProviderCall,
  providerCallSucceeded,
  providerCallTimeout,
} from '@src/ducks/providerBalancer/providerCalls';
import { workerProcessing } from '@src/ducks/providerBalancer/workers';
import { addProviderIdToCall, makeRetVal } from '@src/saga/sagaUtils';
import { providerChannels } from '@src/saga/providerChannels';
import { getProviderInstAndTimeoutThreshold } from '@src/ducks/providerConfigs';
import { delay } from 'redux-saga';
import { IProvider } from '@src/types';

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
      result: apply(provider, provider[rpcMethod] as any, rpcArgs),
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

function* processRequest(providerId: string, workerId: string) {
  const chan = providerChannels.getChannel(providerId);

  // take from the assigned action channel
  const payload: IProviderCall = yield take(chan);
  const { rpcArgs, rpcMethod } = payload;
  const callWithPid = addProviderIdToCall(payload, providerId);

  // after taking a request, declare processing state
  yield put(workerProcessing({ currentPayload: callWithPid, workerId }));

  const { result, error } = yield call(
    sendRequestToProvider,
    providerId,
    rpcMethod,
    rpcArgs,
  );

  if (result) {
    const action = providerCallSucceeded({
      result,
      providerCall: callWithPid,
    });
    return yield put(action);
  } else {
    console.log(`${workerId} failed request ${payload.callId}`);

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
      // shared cancellation logic
      console.error(`${thisId} has been cancelled`);
    }
  }
}
