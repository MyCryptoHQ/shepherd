import {
  BALANCER,
  BalancerInitAction,
  BalancerNetworkSwitchRequestedAction,
  balancerNetworkSwitchSucceeded,
} from '@src/ducks/providerBalancer/balancerConfig';
import { SagaIterator } from 'redux-saga';
import { call, fork, put, take } from 'redux-saga/effects';
import { initializeNewNetworkProviders } from './helpers';

function* handleNetworkSwitch(): SagaIterator {
  while (true) {
    const {
      payload,
    }: BalancerNetworkSwitchRequestedAction | BalancerInitAction = yield take([
      BALANCER.NETWORK_SWTICH_REQUESTED,
      BALANCER.INIT,
    ]);

    const networkSwitchPayload = yield call(
      initializeNewNetworkProviders,
      payload.network,
    );
    console.log('network switch succeeded');
    yield put(balancerNetworkSwitchSucceeded(networkSwitchPayload));
  }
}

// we dont use takeevery here to avoid processing two switch requests at the same time
export const watchNetworkSwitches = [fork(handleNetworkSwitch)];
