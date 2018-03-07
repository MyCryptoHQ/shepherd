import { RootState } from '@src/ducks';
import { Omit } from '@src/types';
import {
  NodeCall,
  getPendingNodeCallsByNodeId,
} from '@src/ducks/nodeBalancer/nodeCalls';
import {
  getNodeStats,
  NodeStatsState,
} from '@src/ducks/nodeBalancer/nodeStats';
import { getWorkerById } from '@src/ducks/nodeBalancer/workers';

export const getNodeBalancer = (state: RootState) => state.nodeBalancer;

export type AvailableNodes = {
  [nodeId in keyof NodeStatsState]: Omit<
    NodeStatsState[nodeId],
    'isOffline'
  > & {
    isOffline: false;
  }
};

/**
 * @description an available node === it being online
 * @param state
 */
export const getAvailableNodes = (state: RootState): AvailableNodes => {
  const nodes = getNodeStats(state);
  const initialState: AvailableNodes = {};

  const isAvailable = (
    node: NodeStatsState[string],
  ): node is AvailableNodes[string] => !node.isOffline;

  return Object.entries(nodes).reduce((accu, [curNodeId, curNode]) => {
    if (isAvailable(curNode)) {
      return { ...accu, [curNodeId]: curNode };
    }
    return accu;
  }, initialState);
};

export const getAllMethodsAvailable = (state: RootState): boolean => {
  const allMethods = [
    'client',
    'requests',
    'ping',
    'sendCallRequest',
    'getBalance',
    'estimateGas',
    'getTokenBalance',
    'getTokenBalances',
    'getTransactionCount',
    'getCurrentBlock',
    'sendRawTx',
  ];

  const availableNodes = getAvailableNodes(state);

  // goes through each available node and reduces all of their
  // available methods into a mapping that contains all supported methods
  const availableMethods = Object.values(availableNodes).reduce<{
    [availableMethod: string]: boolean;
  }>(
    (methods, { supportedMethods }) => ({
      ...methods,
      ...Object.entries(supportedMethods).reduce(
        // creates a mapping of all supported methods, excluding unsupported ones
        (accu, [rpcMethod, isSupported]) => ({
          ...accu,
          ...(isSupported ? { [rpcMethod]: true } : {}),
        }),
        {},
      ),
    }),
    {},
  );

  return allMethods.reduce(
    (allAvailable, curMethod) => allAvailable && availableMethods[curMethod],
    true,
  );
};

// available nodes -> nodes that support the method -> nodes that are whitelisted -> prioritized nodes -> workers not busy
// TODO: include response time in prioritization
export const getAvailableNodeId = (state: RootState, payload: NodeCall) => {
  const { nodeWhiteList, rpcMethod, minPriorityNodeList } = payload;
  const availableNodes = getAvailableNodes(state);

  const availableNodesArr = Object.entries(availableNodes);
  // filter by nodes that can support this method
  const supportsMethod = availableNodesArr.filter(
    ([_, stats]) => stats.supportedMethods[rpcMethod],
  );

  // filter nodes that are in the whitelist
  const isWhitelisted = nodeWhiteList
    ? supportsMethod.filter(([nodeId]) => nodeWhiteList.includes(nodeId))
    : supportsMethod;

  // grab the nodes that are not included in min priority
  const prioritized1 = isWhitelisted.filter(
    ([nodeId]) => !minPriorityNodeList.includes(nodeId),
  );

  // grab the nodes that are included
  const prioritized2 = isWhitelisted.filter(([nodeId]) =>
    minPriorityNodeList.includes(nodeId),
  );

  // prioritize the list by using nodes with most workers free
  const listToPrioritizeByWorker =
    prioritized1.length > 0 ? prioritized1 : prioritized2;

  let prevNode: {
    nodeId: string;
    numOfRequestsCurrentProcessing: number;
  } | null = null;

  for (const [currentNodeId] of listToPrioritizeByWorker) {
    const numOfRequestsCurrentProcessing = getPendingNodeCallsByNodeId(
      state,
      currentNodeId,
    );

    // if there's no selected node yet (aka first iteration)
    // or
    // the current node has less requests processing, switch the next node to current node
    if (
      !prevNode ||
      prevNode.numOfRequestsCurrentProcessing > numOfRequestsCurrentProcessing
    ) {
      prevNode = { nodeId: currentNodeId, numOfRequestsCurrentProcessing };
    }
  }

  return prevNode ? prevNode.nodeId : null;
};
