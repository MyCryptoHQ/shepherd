import { ProviderConfig } from '@src/types/providers';
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
  getProviderStatsById,
  providerAdded,
} from '@src/ducks/providerBalancer/providerStats';
import {
  ProviderCall,
  providerCallSucceeded,
  providerCallTimeout,
} from '@src/ducks/providerBalancer/providerCalls';
import { Channel, buffers, channel, Task, delay } from 'redux-saga';
import {
  IWorker,
  workerProcessing,
  workerSpawned,
} from '@src/ducks/providerBalancer/workers';
import { channels } from '@src/saga';
import { IChannels, Workers } from '@src/saga/types';
import {
  getProviderConfigById,
  AddProviderConfigAction,
} from '@src/ducks/providerConfigs/configs';
import { checkProviderConnectivity } from '@src/saga/providerHealth';

export function* handleAddingProvider({
  payload: { config, id },
}: AddProviderConfigAction) {
  const res: {
    providerId: string;
    stats: IProviderStats;
    workers: Workers;
  } = yield call(handleAddingProviderHelper, id, config);

  // these two ops might need to be done in one op
  yield put(providerAdded({ ...res.stats, providerId: res.providerId }));

  for (const [workerId, worker] of Object.entries(res.workers)) {
    yield put(
      workerSpawned({
        providerId: worker.assignedProvider,
        workerId,
        task: worker.task,
      }),
    );
  }
}

/**
 *
 * @description Handles checking if a provider is online or not, and adding it to the provider balancer
 * @param {string} providerId
 * @param {ProviderConfig} providerConfig
 */
export function* handleAddingProviderHelper(
  providerId: string,
  providerConfig: ProviderConfig,
) {
  const startTime = new Date();
  console.log(channel);
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
    isCustom: providerConfig.isCustom,
    timeoutThresholdMs: 2000,
    currWorkersById: [],
    maxWorkers: 5,
    requestFailures: 0,
    requestFailureThreshold: 2,
    supportedMethods: {
      ping: true,
      sendCallRequest: true,
      getBalance: true,
      estimateGas: true,
      getTransactionCount: true,
      getCurrentBlock: true,
      sendRawTx: true,
    },
  };

  const providerChannel: Channel<ProviderCall> = yield call(
    channel,
    buffers.expanding(10),
  );

  channels[providerId] = providerChannel;

  const workers: Workers = {};
  for (
    let workerNumber = stats.currWorkersById.length;
    workerNumber < stats.maxWorkers;
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
  const providerConfig: ProviderConfig | undefined = yield select(
    getProviderConfigById,
    providerId,
  );

  if (!providerConfig) {
    throw Error(`Provider ${providerId} not found when selecting from state`);
  }

  let currentPayload: ProviderCall;
  while (true) {
    try {
      // take from the assigned action channel
      const payload: ProviderCall = yield take(chan);
      currentPayload = payload;
      // after taking a request, declare processing state
      yield put(
        workerProcessing({ currentPayload: payload, workerId: thisId }),
      );

      const providerStats: Readonly<IProviderStats> | undefined = yield select(
        getProviderStatsById,
        providerId,
      );

      if (!providerStats) {
        throw createInternalError(
          `Could not find stats for provider ${providerId}`,
        );
      }

      const lib = providerConfig.pLib;

      // make the call in the allotted timeout time
      // this will create an infinite loop
      const { result, timeout } = yield race({
        result: apply(
          lib,
          lib[payload.rpcMethod] as any,
          payload.rpcArgs as any,
        ),
        timeout: call(delay, providerStats.timeoutThresholdMs),
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
      yield put(providerCallTimeout({ ...currentPayload!, providerId, error }));
    }
  }
}
