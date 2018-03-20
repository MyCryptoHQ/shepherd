import { SagaIterator } from 'redux-saga';
import { call, put, takeEvery } from 'redux-saga/effects';
import {
  balancerFlush,
  balancerNetworkSwitchSucceeded,
  BALANCER,
  setOffline,
  BalancerNetworkSwitchRequestedAction,
  BalancerInitAction,
} from '@src/ducks/providerBalancer/balancerConfig';
import { initializeNewNetworkProviders } from './helpers';

function* handleNetworkSwitch({
  payload,
}: BalancerNetworkSwitchRequestedAction | BalancerInitAction): SagaIterator {
  yield put(setOffline());
  yield put(balancerFlush());
  const networkSwitchPayload = yield call(
    initializeNewNetworkProviders,
    payload.network,
  );
  yield put(balancerNetworkSwitchSucceeded(networkSwitchPayload));
}

export const watchNetworkSwitches = [
  takeEvery(
    [BALANCER.NETWORK_SWTICH_REQUESTED, BALANCER.INIT],
    handleNetworkSwitch,
  ),
];
