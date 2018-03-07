import { SagaIterator, buffers } from 'redux-saga';
import { put, take, select, actionChannel } from 'redux-saga/effects';
import {
  NodeCall,
  NodeCallRequestedAction,
  NodeCallTimeoutAction,
  nodeCallFailed,
  nodeCallRequested,
  NODE_CALL,
} from '@src/ducks/nodeBalancer/nodeCalls';
import { BALANCER, setOffline } from '@src/ducks/nodeBalancer/balancerConfig';
import {
  INodeStats,
  nodeOffline,
  getNodeStatsById,
} from '@src/ducks/nodeBalancer/nodeStats';
import { isOffline } from '@src/ducks/nodeBalancer/balancerConfig/selectors';
import {
  getAvailableNodeId,
  getAllMethodsAvailable,
} from '@src/ducks/nodeBalancer/selectors';
import { channels } from '@src/saga';

// need to check this arbitary number
const MAX_NODE_CALL_TIMEOUTS = 3;

export function* handleNodeCallRequests(): SagaIterator {
  const requestChan = yield actionChannel(
    NODE_CALL.REQUESTED,
    buffers.expanding(50),
  );
  while (true) {
    const { payload }: NodeCallRequestedAction = yield take(requestChan);
    // check if the app is offline
    if (yield select(isOffline)) {
      yield take(BALANCER.ONLINE); // wait until its back online
    }

    // get an available nodeId to put the action to the channel
    const nodeId: string | null = yield select(getAvailableNodeId, payload);
    const nodeChannel = channels[nodeId];
    yield put(nodeChannel, payload);
  }
}

export function* handleCallTimeouts({
  payload: { error, nodeId, ...nodeCall },
}: NodeCallTimeoutAction): SagaIterator {
  const nodeStats: Readonly<INodeStats> | undefined = yield select(
    getNodeStatsById,
    nodeId,
  );
  if (!nodeStats) {
    throw Error('Could not find node stats');
  }
  // if the node has reached maximum failures, declare it as offline
  if (nodeStats.requestFailures >= nodeStats.requestFailureThreshold) {
    yield put(nodeOffline({ nodeId }));

    //check if all methods are still available after this node goes down
    const isAllMethodsAvailable: boolean = yield select(getAllMethodsAvailable);
    if (!isAllMethodsAvailable) {
      // if not, set app state offline and flush channels

      yield put(setOffline());
    }
  }

  // if the payload exceeds timeout limits, return a response failure
  if (nodeCall.numOfTimeouts > MAX_NODE_CALL_TIMEOUTS) {
    yield put(nodeCallFailed({ error: error.message, nodeCall }));
  } else {
    // else consider it a timeout on the request to be retried
    // might want to make this a seperate action
    // add nodeId to min priority to avoid it if possible
    const nextNodeCall: NodeCall = {
      ...nodeCall,
      minPriorityNodeList: [...nodeCall.minPriorityNodeList, nodeId],
      numOfTimeouts: ++nodeCall.numOfTimeouts,
    };
    yield put(nodeCallRequested(nextNodeCall));
  }
}
