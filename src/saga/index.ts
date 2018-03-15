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
import { PROVIDER_CALL } from '@src/ducks/providerBalancer/providerCalls';
import {
  balancerFlush,
  BalancerNetworkSwitchSucceededAction,
  balancerNetworkSwitchSucceeded,
  BalancerFlushAction,
  BALANCER,
  setOffline,
  setOnline,
  BalancerNetworkSwitchRequestedAction,
  balancerNetworkSwitchRequested,
} from '@src/ducks/providerBalancer/balancerConfig';
import {
  IProviderStats,
  PROVIDER_STATS,
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
import { PROVIDER_CONFIG, IProviderConfig } from '@src/ducks/providerConfigs';
import { StrIdx } from '@src/types';
import { getNetwork } from '@src/ducks/providerBalancer/balancerConfig/selectors';

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
  const processedProviders: {
    providerId: string;
    stats: IProviderStats;
    workers: Workers;
  }[] = yield all(providerEntries);

  type NetworkPayload = BalancerNetworkSwitchSucceededAction['payload'];

  const initialState: NetworkPayload = {
    providerStats: {},
    workers: {},
    network: payload.network,
  };

  const networkSwitchPayload = processedProviders.reduce(
    (accu, currProvider) => {
      const curProviderStats: NetworkPayload['providerStats'] = {
        [currProvider.providerId]: currProvider.stats,
      };

      const providerStats: NetworkPayload['providerStats'] = {
        ...accu.providerStats,
        ...curProviderStats,
      };

      const workers: NetworkPayload['workers'] = {
        ...accu.workers,
        ...currProvider.workers,
      };

      return {
        ...accu,
        providerStats,
        workers,
      };
    },
    initialState,
  );

  yield put(balancerNetworkSwitchSucceeded(networkSwitchPayload));

  yield put(setOnline());
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
    takeEvery(PROVIDER_CALL.TIMEOUT, handleCallTimeouts),
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
