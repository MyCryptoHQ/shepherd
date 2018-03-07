import {
  nodeOnline,
  NodeOfflineAction,
} from '@src/ducks/nodeBalancer/nodeStats';
import { NodeConfig } from '@src/types/nodes';
import { call, select, put, apply, race } from 'redux-saga/effects';
import { getNodeConfigById } from '@src/ducks/nodeConfigs/configs';
import { delay } from 'redux-saga';
import { getAllMethodsAvailable } from '@src/ducks/nodeBalancer/selectors';
import { setOnline } from '@src/ducks/nodeBalancer/balancerConfig';

/**
 * @description polls the offline state of a node, then returns control to caller when it comes back online
 * @param {string} nodeId
 */
export function* checkNodeConnectivity(nodeId: string, poll: boolean = true) {
  const nodeConfig: NodeConfig = yield select(getNodeConfigById, nodeId);
  while (true) {
    try {
      console.log(`Polling ${nodeId} to see if its online...`);
      const { lb } = yield race({
        lb: apply(nodeConfig.pLib, nodeConfig.pLib.getCurrentBlock),
        to: call(delay, 5000),
      });
      if (lb) {
        console.log(`${nodeId} online!`);
        return true;
      }
    } catch (error) {
      console.info(error);

      if (!poll) {
        return false;
      }
      yield call(delay, 5000);
    }
    console.log(`${nodeId} still offline`);
  }
}

export function* watchOfflineNode({ payload: { nodeId } }: NodeOfflineAction) {
  yield call(checkNodeConnectivity, nodeId);

  yield put(nodeOnline({ nodeId }));

  // check if all methods are available after this node is online
  const isAllMethodsAvailable: boolean = yield select(getAllMethodsAvailable);

  // if they are, put app in online state
  if (isAllMethodsAvailable) {
    yield put(setOnline());
  }
}
