import {
  BALANCER,
  balancerNetworkSwitchSucceeded,
  IBalancerInit,
  IBalancerNetworkSwitchRequested,
} from '@src/ducks/providerBalancer/balancerConfig';
import { logger } from '@src/utils/logging';
import { buffers, SagaIterator } from 'redux-saga';
import { actionChannel, call, fork, put, take } from 'redux-saga/effects';
import { initializeNewNetworkProviders } from './helpers';

function* handleNetworkSwitch({
  payload,
  meta,
}: IBalancerNetworkSwitchRequested | IBalancerInit): SagaIterator {
  const networkSwitchPayload = yield call(
    initializeNewNetworkProviders,
    payload.network,
  );
  logger.log(`Network switch to ${payload.network} succeeded`);

  yield put(balancerNetworkSwitchSucceeded(networkSwitchPayload, meta.id));
}

function* networkSwitchActionChannel() {
  const chan = yield actionChannel(
    [BALANCER.NETWORK_SWTICH_REQUESTED, BALANCER.INIT],
    buffers.expanding(50),
  );
  while (true) {
    const action: IBalancerNetworkSwitchRequested | IBalancerInit = yield take(
      chan,
    );
    logger.log(`Taking action ${JSON.stringify(action, null, 1)}`);
    yield call(handleNetworkSwitch, action);
  }
}

// we dont use takeevery here to avoid processing two switch requests at the same time
export const watchNetworkSwitches = [fork(networkSwitchActionChannel)];
