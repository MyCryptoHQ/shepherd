import {
  setupWeb3Provider,
  isWeb3ProviderAvailable,
  Web3SetupReturn,
} from '@src/providers/web3/utils';
import { SagaIterator, delay, Task } from 'redux-saga';
import { call, select, put, take, fork, cancel } from 'redux-saga/effects';
import { NumIdx } from '@src/types';
import { getNetwork } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { addProviderConfig } from '@src/ducks/providerConfigs';
import {
  balancerNetworkSwitchRequested,
  BALANCER,
  BalancerUnsetAmbientAction,
  BalancerInitAction,
  balancerUnsetAmbientProvider,
  BalancerSetAmbientRequestedAction,
  balancerSetAmbientSucceededProvider,
} from '@src/ducks/providerBalancer/balancerConfig';
import { ProviderStatsAddedAction } from '@src/ducks/providerBalancer/providerStats';
import { AnyAction } from 'redux';

const chainIdToNetwork: NumIdx<string> = {
  1: 'ETH',
  2: 'EXP',
  3: 'Ropsten',
  4: 'Rinkeby',
  8: 'UBQ',
  42: 'Kovan',
  61: 'ETC',
};

// todo: get the net version of all of the current providers instead and match via that way

function* attemptAmbientProviderSetup() {
  const providerAvailable = yield call(isWeb3ProviderAvailable);
  if (!providerAvailable) {
    throw Error();
  }
  const { networkId }: Web3SetupReturn = yield call(setupWeb3Provider);

  const ambientNetwork = chainIdToNetwork[+networkId]
    ? chainIdToNetwork[+networkId]
    : 'AmbientProviderNetwork';

  yield put(
    addProviderConfig({
      id: 'AmbientProvider',
      config: {
        concurrency: 6,
        network: ambientNetwork,
        requestFailureThreshold: 3,
        supportedMethods: {
          estimateGas: true,
          getBalance: true,
          getCurrentBlock: true,
          getTransactionCount: true,
          ping: true,
          sendCallRequest: true,
          sendRawTx: true,
        },
        timeoutThresholdMs: 5000,
      },
    }),
  );
  // wait for action to match this provider
  const action: ProviderStatsAddedAction = yield take((action: AnyAction) => {
    return false;
  });
  action.payload.providerId;
  const currNetwork = yield select(getNetwork);
  // slightly unoptimal, as itll trigger two flushes if the network is different
  if (currNetwork === ambientNetwork) {
  } else {
    yield put(balancerNetworkSwitchRequested({ network: ambientNetwork }));
    yield take(BALANCER.NETWORK_SWITCH_SUCCEEDED);
  }
  yield put(balancerSetAmbientSucceededProvider());
}

function* pollForAmbientProvider(): SagaIterator {
  const successfullySetup: boolean = yield call(attemptAmbientProviderSetup);
  if (successfullySetup) {
    return;
  }
}

// poll the ambient provider for network changes
// if it does change before it gets unset
// then change the config to the new network
// and request a network switch
function* pollAmbientProviderForNetworkChange(): SagaIterator {}

let pollTask: Task;

function* handleAmbientActions(
  action:
    | BalancerInitAction
    | BalancerSetAmbientRequestedAction
    | BalancerUnsetAmbientAction,
): SagaIterator {
  const shouldPollForAmbientProvider =
    (action.type === BALANCER.INIT && action.payload.ambientProviderSet) ||
    action.type === BALANCER.SET_AMBIENT_REQUESTED;

  const shouldCancelPolling = action.type === BALANCER.UNSET_AMBIENT;

  if (shouldPollForAmbientProvider) {
    pollTask = yield fork(pollForAmbientProvider);
  } else if (shouldCancelPolling) {
    if (pollTask) {
      yield cancel(pollTask);
    }
    yield put(balancerUnsetAmbientProvider());
  }
}
