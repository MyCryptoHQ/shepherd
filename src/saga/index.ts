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
import {
  NodeCall,
  nodeCallRequested,
  NODE_CALL,
  getNodeCallById,
} from '@src/ducks/nodeBalancer/nodeCalls';
import {
  balancerFlush,
  NetworkSwitchSucceededAction,
  networkSwitchSucceeded,
  BalancerFlushAction,
  BALANCER,
  setOffline,
  setOnline,
} from '@src/ducks/nodeBalancer/balancerConfig';
import { NodeConfig } from '@src/types/nodes';
import { INodeStats, NODE } from '@src/ducks/nodeBalancer/nodeStats';
import { getAllNodesOfCurrentNetwork } from '@src/ducks/selectors';
import { store } from '@src/ducks';
import RpcNode from '@src/nodes/rpc';
import { Workers, IChannels } from '@src/saga/types';
import { handleAddingNode } from '@src/saga/addingNodes';
import { watchOfflineNode } from '@src/saga/nodeHealth';
import {
  handleNodeCallRequests,
  handleCallTimeouts,
} from '@src/saga/nodeCalls';

/**
 *  For now we're going to hard code the initial node configuration in,
 *  ideally on initialization, a ping call gets sent to every node in the current network
 *  to determine which nodes are offline on app start using 'NodeAdded'
 *  then spawn workers for each node from there using 'WorkerSpawned'
 *
 */

export const channels: IChannels = {};

function* networkSwitch(): SagaIterator {
  yield put(setOffline());
  //flush all existing requests
  yield put(balancerFlush());

  const nodes: {
    [x: string]: NodeConfig;
  } = yield select(getAllNodesOfCurrentNetwork);

  const nodeEntries = Object.entries(nodes).map(([nodeId, nodeConfig]) =>
    call(handleAddingNode, nodeId, nodeConfig),
  );

  // process adding all nodes in parallel
  const processedNodes: {
    nodeId: string;
    stats: INodeStats;
    workers: Workers;
  }[] = yield all(nodeEntries);

  const networkSwitchPayload = processedNodes.reduce<
    NetworkSwitchSucceededAction['payload']
  >(
    (accu, currNode) => ({
      nodeStats: { ...accu.nodeStats, [currNode.nodeId]: currNode.stats },
      workers: { ...accu.workers, ...currNode.workers },
    }),
    { nodeStats: {}, workers: {} },
  );

  yield put(networkSwitchSucceeded(networkSwitchPayload));

  yield put(setOnline());
}

export const nodeCallRequester = (() => {
  let callId = 0;
  return (rpcMethod: keyof RpcNode) => (...rpcArgs: string[]) =>
    new Promise((resolve, reject) => {
      // allow all nodes for now
      const nodeCall: NodeCall = {
        callId: ++callId,
        numOfTimeouts: 0,
        rpcArgs,
        rpcMethod,
        minPriorityNodeList: [],
      };

      // make the request to the load balancer
      const networkReq = nodeCallRequested(nodeCall);
      store.dispatch(networkReq);

      const unsubscribe = store.subscribe(() => {
        const state = store.getState();
        const nodeCall = getNodeCallById(state, networkReq.payload.callId);
        if (nodeCall && !nodeCall.pending) {
          nodeCall.result ? resolve(nodeCall.result) : reject(nodeCall.error);
          return unsubscribe();
        }
      });
    });
})();

function* flushHandler(_: BalancerFlushAction): SagaIterator {
  const channelValues = Object.values(channels);
  for (const chan of channelValues) {
    yield flush(chan);
  }
}

export function* nodeBalancer() {
  yield all([
    call(networkSwitch),
    takeEvery(BALANCER.NETWORK_SWTICH_REQUESTED, networkSwitch),
    takeEvery(NODE.OFFLINE, watchOfflineNode),
    fork(handleNodeCallRequests),
    takeEvery(NODE_CALL.TIMEOUT, handleCallTimeouts),
    takeEvery(BALANCER.FLUSH, flushHandler),
  ]);
}
