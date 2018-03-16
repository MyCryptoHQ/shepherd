import { call, spawn, select, take, put } from 'redux-saga/effects';
import {
  providerAdded,
  providerOffline,
  ProcessedProvider,
} from '@src/ducks/providerBalancer/providerStats';
import {
  IProviderCall,
  providerCallSucceeded,
  providerCallTimeout,
} from '@src/ducks/providerBalancer/providerCalls';
import { Task } from 'redux-saga';
import { workerProcessing } from '@src/ducks/providerBalancer/workers';
import { IChannels, Workers } from '@src/saga/types';
import {
  AddProviderConfigAction,
  IProviderConfig,
} from '@src/ducks/providerConfigs';
import {
  checkProviderConnectivity,
  watchOfflineProvider,
} from '@src/saga/providerHealth';
import { getNetwork } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import {
  trackTime,
  makeProviderStats,
  makeWorkerId,
  makeWorker,
  addProviderIdToCall,
} from '@src/saga/sagaUtils';
import {
  sendRequestToProvider,
  addProviderChannel,
} from '@src/saga/sagaHelpers';

export function* handleAddingProvider({
  payload: { config, id },
}: AddProviderConfigAction) {
  const network: string = yield select(getNetwork);
  if (network !== config.network) {
    return;
  }

  const processedProvider: ProcessedProvider = yield call(
    handleAddingProviderHelper,
    id,
    config,
  );

  yield put(providerAdded(processedProvider));
}

/**
 *
 * @description Handles checking if a provider is online or not, and adding it to the provider balancer
 * @param {string} providerId
 * @param {ProviderConfig} config
 */
export function* handleAddingProviderHelper(
  providerId: string,
  { concurrency }: IProviderConfig,
) {
  const timer = trackTime();
  const providerIsOnline: boolean = yield call(
    checkProviderConnectivity,
    providerId,
  );

  const stats = makeProviderStats(timer, !providerIsOnline);

  if (!providerIsOnline) {
    yield spawn(watchOfflineProvider, providerOffline({ providerId }));
  }

  const { workers, workerIds } = yield call(
    spawnWorkers,
    providerId,
    stats.currWorkersById,
    concurrency,
  );

  stats.currWorkersById = workerIds;

  return { providerId, stats, workers };
}

function* spawnWorkers(
  providerId: string,
  currentWorkers: string[],
  maxNumOfWorkers: number,
) {
  const providerChannel = yield call(addProviderChannel, providerId);
  const workers: Workers = {};

  for (
    let workerNumber = currentWorkers.length;
    workerNumber < maxNumOfWorkers;
    workerNumber++
  ) {
    const workerId = makeWorkerId(providerId, workerNumber);
    const workerTask: Task = yield spawn(
      spawnWorker,
      workerId,
      providerId,
      providerChannel,
    );

    workers[workerId] = makeWorker(providerId, workerTask);
  }

  return { workers, workerIds: [...currentWorkers, ...Object.keys(workers)] };
}
function* spawnWorker(
  thisId: string,
  providerId: string,
  chan: IChannels[string],
) {
  while (true) {
    // take from the assigned action channel
    const payload: IProviderCall = yield take(chan);
    const { rpcArgs, rpcMethod } = payload;
    const callWithPid = addProviderIdToCall(payload, providerId);

    // after taking a request, declare processing state
    yield put(
      workerProcessing({ currentPayload: callWithPid, workerId: thisId }),
    );

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
      const action = providerCallTimeout({
        providerCall: callWithPid,
        error,
      });
      return yield put(action);
    }
  }
}
