import {
  call,
  spawn,
  select,
  take,
  put,
  apply,
  race,
} from 'redux-saga/effects';
import {
  IProviderStats,
  providerAdded,
} from '@src/ducks/providerBalancer/providerStats';
import {
  IProviderCall,
  providerCallSucceeded,
  providerCallTimeout,
} from '@src/ducks/providerBalancer/providerCalls';
import { Channel, buffers, channel, Task, delay } from 'redux-saga';
import { IWorker, workerProcessing } from '@src/ducks/providerBalancer/workers';
import { channels } from '@src/saga';
import { IChannels, Workers } from '@src/saga/types';
import {
  getProviderConfigById,
  AddProviderConfigAction,
  IProviderConfig,
} from '@src/ducks/providerConfigs';
import { checkProviderConnectivity } from '@src/saga/providerHealth';
import { IProvider } from '@src/types';
import { providerStorage } from '@src/providers';

export function* handleAddingProvider({
  payload: { config, id },
}: AddProviderConfigAction) {
  const res: {
    providerId: string;
    stats: IProviderStats;
    workers: Workers;
  } = yield call(handleAddingProviderHelper, id, config);

  yield put(
    providerAdded({
      stats: res.stats,
      providerId: res.providerId,
      workers: res.workers,
    }),
  );
}

/**
 *
 * @description Handles checking if a provider is online or not, and adding it to the provider balancer
 * @param {string} providerId
 * @param {ProviderConfig} providerConfig
 */
export function* handleAddingProviderHelper(
  providerId: string,
  providerConfig: IProviderConfig,
) {
  const startTime = new Date();
  const providerIsOnline: boolean = yield call(
    checkProviderConnectivity,
    providerId,
    false,
  );
  const endTime = new Date();
  const avgResponseTime = +endTime - +startTime;
  const stats: IProviderStats = {
    avgResponseTime,
    isOffline: !providerIsOnline,
    currWorkersById: [],
    requestFailures: 0,
  };

  const providerChannel: Channel<IProviderCall> = yield call(
    channel,
    buffers.expanding(10),
  );

  channels[providerId] = providerChannel;

  const workers: Workers = {};
  for (
    let workerNumber = stats.currWorkersById.length;
    workerNumber < providerConfig.concurrency;
    workerNumber++
  ) {
    const workerId = `${providerId}_worker_${workerNumber}`;
    const workerTask: Task = yield spawn(
      spawnWorker,
      workerId,
      providerId,
      providerChannel,
    );
    console.log(`Worker ${workerId} spawned for ${providerId}`);
    stats.currWorkersById.push(workerId);
    const worker: IWorker = {
      assignedProvider: providerId,
      currentPayload: null,
      task: workerTask,
    };
    workers[workerId] = worker;
  }

  return { providerId, stats, workers };
}

function* spawnWorker(
  thisId: string,
  providerId: string,
  chan: IChannels[string],
) {
  /**
   * @description used to differentiate between errors from worker code vs a network call error
   * @param message
   */
  const createInternalError = (message: string) => {
    const e = Error(message);
    e.name = 'InternalError';
    return e;
  };

  //select the provider config on initialization to avoid re-selecting on every request handled
  const provider: IProvider | undefined = providerStorage.getInstance(
    providerId,
  );

  let currentPayload: IProviderCall;
  while (true) {
    try {
      // take from the assigned action channel
      const payload: IProviderCall = yield take(chan);
      currentPayload = payload;

      // after taking a request, declare processing state
      yield put(
        workerProcessing({ currentPayload: payload, workerId: thisId }),
      );

      const providerConfig: IProviderConfig | null = yield select(
        getProviderConfigById,
        providerId,
      );

      if (!providerConfig) {
        throw createInternalError(
          `Could not find stats for provider ${providerId}`,
        );
      }

      // make the call in the allotted timeout time
      const { result, timeout } = yield race({
        result: apply(
          provider,
          provider[payload.rpcMethod] as any,
          payload.rpcArgs as any,
        ),
        timeout: call(delay, providerConfig.timeoutThresholdMs),
      });

      //TODO: clean this up
      if (timeout || !result) {
        throw createInternalError(`Request timed out for ${providerId}`);
      }
      console.log('Finished', thisId, payload.callId);
      yield put(
        providerCallSucceeded({
          result,
          providerCall: { ...payload, providerId: thisId },
        }),
      );
    } catch (error) {
      const e: Error = error;
      if (!(e.name === 'InternalError')) {
        e.name = `NetworkError_${e.name}`;
      }
      console.error(e);
      yield put(
        providerCallTimeout({
          providerCall: currentPayload!,
          providerId,
          error,
        }),
      );
    }
  }
}
