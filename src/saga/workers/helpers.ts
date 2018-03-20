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
  getPendingProviderCallsByProviderId,
} from '@src/ducks/providerBalancer/providerCalls';
import { workerProcessing } from '@src/ducks/providerBalancer/workers';
import {
  addProviderIdToCall,
  createInternalError,
  makeRetVal,
} from '@src/saga/sagaUtils';
import { providerChannels } from '@src/saga/providerChannels';
import { getProviderInstAndTimeoutThreshold } from '@src/ducks/providerConfigs';
import { delay, Channel } from 'redux-saga';
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
      const error = createInternalError(`Request timed out for ${providerId}`);
      return makeRetVal(error);
    }

    return makeRetVal(null, result);
  } catch (error) {
    error.name += 'NetworkError_';
    return makeRetVal(error);
  }
}

function* processRequest(
  providerId: string,
  workerId: string,
  chan: Channel<IProviderCall>,
) {
  // take from the assigned action channel
  const payload: IProviderCall = yield take(chan);
  const { rpcArgs, rpcMethod } = payload;
  const callWithPid = addProviderIdToCall(payload, providerId);

  // after taking a request, declare processing state
  yield put(workerProcessing({ currentPayload: callWithPid, workerId }));

  //console.log(
  //  `${workerId} processing request -- pending calls:  ${pendingCalls}`,
  //);

  const { result, error } = yield call(
    sendRequestToProvider,
    providerId,
    rpcMethod,
    rpcArgs,
  );

  if (result) {
    //    console.log(`${workerId} finished request`);

    const action = providerCallSucceeded({
      result,
      providerCall: callWithPid,
    });
    return yield put(action);
  } else {
    console.log(`${workerId} failed request`);

    const action = providerCallTimeout({
      providerCall: callWithPid,
      error,
    });
    return yield put(action);
  }
}

function* processIncomingRequests(
  thisId: string,
  providerId: string,
  chan: Channel<IProviderCall>,
) {
  while (true) {
    yield call(processRequest, providerId, thisId, chan);
  }
}

export function* createWorker(thisId: string, providerId: string) {
  try {
    const chan = providerChannels.getChannel(providerId);

    yield call(processIncomingRequests, thisId, providerId, chan);
  } catch (e) {
    console.error(`${thisId} as errored with ${e.message}`);
  } finally {
    if (yield cancelled()) {
      // shared cancellation logic
      console.error(`${thisId} has been cancelled`);
    }
  }
}
