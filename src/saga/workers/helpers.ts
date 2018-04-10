import {
  IProviderCallRequested,
  isStaleCall,
  providerCallFailed,
  providerCallSucceeded,
  providerCallTimeout,
} from '@src/ducks/providerBalancer/providerCalls';
import { workerProcessing } from '@src/ducks/providerBalancer/workers';
import { getProviderInstAndTimeoutThreshold } from '@src/ducks/providerConfigs';
import { providerChannels } from '@src/saga/channels';
import { addProviderIdToCall, makeRetVal } from '@src/saga/sagaUtils';
import { IProvider } from '@src/types';
import { logger } from '@src/utils/logging';
import { delay } from 'redux-saga';
import { apply, call, cancelled, put, race, select } from 'redux-saga/effects';

function* sendRequestToProvider(
  providerId: string,
  rpcMethod: keyof IProvider,
  rpcArgs: any,
) {
  try {
    const {
      provider,
      timeoutThreshold,
    }: ReturnType<typeof getProviderInstAndTimeoutThreshold> = yield select(
      getProviderInstAndTimeoutThreshold,
      providerId,
    );

    // make the call in the allotted timeout time
    const { result } = yield race({
      result: apply(provider, (provider as any)[rpcMethod], rpcArgs),
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
  // take from the assigned action channel
  const { payload }: IProviderCallRequested = yield apply(
    providerChannels,
    providerChannels.take,
    [providerId],
  );
  const { rpcArgs, rpcMethod } = payload;
  const callWithPid = addProviderIdToCall(payload, providerId);

  if (yield select(isStaleCall, payload.callId)) {
    logger.log(`Call ${payload.callId} is stale before processing`);
    return;
  }
  // after taking a request, declare processing state
  yield put(workerProcessing({ currentPayload: callWithPid, workerId }));

  const { result, error } = yield call(
    sendRequestToProvider,
    providerId,
    rpcMethod,
    rpcArgs,
  );

  if (yield select(isStaleCall, payload.callId)) {
    logger.log(`Call ${payload.callId} is stale after processing`);
    return;
  }

  if (result) {
    const action = providerCallSucceeded({
      result,
      providerCall: callWithPid,
    });
    return yield put(action);
  } else {
    const isWeb3SendTx = rpcMethod === 'sendTransaction';
    const actionParams = {
      providerCall: callWithPid,
      error,
    };
    const action = isWeb3SendTx
      ? providerCallFailed(actionParams)
      : providerCallTimeout(actionParams);

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
      logger.log(`${thisId} has been cancelled`);
    }
  }
}
