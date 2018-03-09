import { SagaIterator } from 'redux-saga';
import {
  call,
  fork,
  put,
  select,
  flush,
  all,
  takeEvery,
} from 'redux-saga/effects';
import { PROVIDER_CALL } from '@src/ducks/providerBalancer/providerCalls';
import {
  balancerFlush,
  NetworkSwitchSucceededAction,
  networkSwitchSucceeded,
  BalancerFlushAction,
  BALANCER,
  setOffline,
  setOnline,
} from '@src/ducks/providerBalancer/balancerConfig';
import { ProviderConfig } from '@src/types/providers';
import {
  IProviderStats,
  PROVIDER,
} from '@src/ducks/providerBalancer/providerStats';
import { getAllProvidersOfCurrentNetwork } from '@src/ducks/selectors';
import { Workers, IChannels } from '@src/saga/types';
import {
  handleAddingProviderHelper,
  handleAddingProvider,
} from '@src/saga/addingProviders';
import { watchOfflineProvider } from '@src/saga/providerHealth';
import {
  handleProviderCallRequests,
  handleCallTimeouts,
} from '@src/saga/providerCalls';
import { PROVIDER_CONFIG } from '@src/ducks/providerConfigs/configs';

/**
 *  For now we're going to hard code the initial provider configuration in,
 *  ideally on initialization, a ping call gets sent to every provider in the current network
 *  to determine which providers are offline on app start using 'ProviderAdded'
 *  then spawn workers for each provider from there using 'WorkerSpawned'
 *
 */

export const channels: IChannels = {};

function* networkSwitch(): SagaIterator {
  yield put(setOffline());
  //flush all existing requests
  yield put(balancerFlush());

  const providers: {
    [x: string]: ProviderConfig;
  } = yield select(getAllProvidersOfCurrentNetwork);

  const providerEntries = Object.entries(providers).map(
    ([providerId, providerConfig]) =>
      call(handleAddingProviderHelper, providerId, providerConfig),
  );

  // process adding all providers in parallel
  const processedProviders: {
    providerId: string;
    stats: IProviderStats;
    workers: Workers;
  }[] = yield all(providerEntries);

  const networkSwitchPayload = processedProviders.reduce<
    NetworkSwitchSucceededAction['payload']
  >(
    (accu, currProvider) => ({
      providerStats: {
        ...accu.providerStats,
        [currProvider.providerId]: currProvider.stats,
      },
      workers: { ...accu.workers, ...currProvider.workers },
    }),
    { providerStats: {}, workers: {} },
  );

  yield put(networkSwitchSucceeded(networkSwitchPayload));

  yield put(setOnline());
}

function* flushHandler(_: BalancerFlushAction): SagaIterator {
  const channelValues = Object.values(channels);
  for (const chan of channelValues) {
    yield flush(chan);
  }
}

export function* providerBalancer() {
  yield all([
    call(networkSwitch),
    takeEvery(BALANCER.NETWORK_SWTICH_REQUESTED, networkSwitch),
    takeEvery(PROVIDER.OFFLINE, watchOfflineProvider),
    fork(handleProviderCallRequests),
    takeEvery(PROVIDER_CALL.TIMEOUT, handleCallTimeouts),
    takeEvery(BALANCER.FLUSH, flushHandler),
    takeEvery(PROVIDER_CONFIG.ADD, handleAddingProvider),
  ]);
}
