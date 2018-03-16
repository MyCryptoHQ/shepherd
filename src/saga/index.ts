import { SagaIterator } from 'redux-saga';
import {
  call,
  fork,
  put,
  select,
  flush,
  all,
  takeEvery,
  take,
} from 'redux-saga/effects';
import {
  balancerFlush,
  balancerNetworkSwitchSucceeded,
  BalancerFlushAction,
  BALANCER,
  setOffline,
  BalancerNetworkSwitchRequestedAction,
  balancerNetworkSwitchRequested,
} from '@src/ducks/providerBalancer/balancerConfig';
import {
  PROVIDER_STATS,
  ProcessedProvider,
} from '@src/ducks/providerBalancer/providerStats';
import { getAllProvidersOfCurrentNetwork } from '@src/ducks/selectors';
import { IChannels } from '@src/saga/types';
import {
  handleAddingProviderHelper,
  handleAddingProvider,
} from '@src/saga/addingProviders';
import { watchOfflineProvider } from '@src/saga/providerHealth';
import {
  handleProviderCallRequests,
  handleCallTimeouts,
} from '@src/saga/providerCalls';
import { PROVIDER_CONFIG, IProviderConfig } from '@src/ducks/providerConfigs';
import { StrIdx } from '@src/types';
import { getNetwork } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { reduceProcessedProviders } from '@src/saga/sagaUtils';

export const channels: IChannels = {};

function* networkSwitch({
  payload,
}: BalancerNetworkSwitchRequestedAction): SagaIterator {
  yield put(setOffline());

  //flush all existing requests
  yield put(balancerFlush());

  const providers: StrIdx<IProviderConfig> = yield select(
    getAllProvidersOfCurrentNetwork,
  );

  const providerEntries = Object.entries(providers).map(
    ([providerId, providerConfig]) =>
      call(handleAddingProviderHelper, providerId, providerConfig),
  );

  // process adding all providers in parallel
  const processedProviders: ProcessedProvider[] = yield all(providerEntries);

  const networkSwitchPayload = reduceProcessedProviders(
    processedProviders,
    payload.network,
  );

  yield put(balancerNetworkSwitchSucceeded(networkSwitchPayload));
}

function* init(): SagaIterator {
  // wait for init call
  yield take(BALANCER.INIT);

  // this network will be either the default or user supplied one
  const network: string = yield select(getNetwork);

  // feed it manually into the network switch call and wait for it to finish
  yield call(networkSwitch, balancerNetworkSwitchRequested({ network }));

  // then spin up the rest of the sagas
  yield all([
    takeEvery(BALANCER.NETWORK_SWTICH_REQUESTED, networkSwitch),
    takeEvery(PROVIDER_STATS.OFFLINE, watchOfflineProvider),
    fork(handleProviderCallRequests),
    takeEvery(BALANCER.FLUSH, flushHandler),
    takeEvery(PROVIDER_CONFIG.ADD, handleAddingProvider),
  ]);
}

function* flushHandler(_: BalancerFlushAction): SagaIterator {
  const channelValues = Object.values(channels);
  for (const chan of channelValues) {
    yield flush(chan);
  }
}

export function* providerBalancer() {
  yield fork(init);
}
