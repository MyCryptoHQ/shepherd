import { IProviderConfig } from '@src/ducks/providerConfigs';
import { trackTime, makeProviderStats } from '@src/saga/sagaUtils';
import { call, put } from 'redux-saga/effects';
import { checkProviderConnectivity } from './connectivity';
import {
  providerOffline,
  ProcessedProvider,
} from '@src/ducks/providerBalancer/providerStats';
import { spawnWorkers } from '@src/saga/workers';

/**
 *
 * @description Handles checking if a provider is online or not,
 * and spawning workers for its concurrency rating
 * @param {string} providerId
 * @param {ProviderConfig} config
 */
export function* processProvider(
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
    yield put(providerOffline({ providerId }));
  }

  const { workers, workerIds } = yield call(
    spawnWorkers,
    providerId,
    stats.currWorkersById,
    concurrency,
  );

  stats.currWorkersById = workerIds;

  const processedProvider: ProcessedProvider = { providerId, stats, workers };
  return processedProvider;
}
