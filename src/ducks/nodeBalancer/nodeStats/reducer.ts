import {
  NetworkSwitchSucceededAction,
  BalancerFlushAction,
  BALANCER,
  BalancerAction,
} from '../balancerConfig/types';
import {
  WorkerKilledAction,
  WorkerSpawnedAction,
  WORKER,
  WorkerAction,
} from '../workers/types';
import {
  NodeOnlineAction,
  NodeOfflineAction,
  NodeAddedAction,
  NodeRemovedAction,
  NODE,
  NodeAction,
} from './types';
import {
  NodeCallTimeoutAction,
  NodeCallAction,
  NODE_CALL,
} from '../nodeCalls/types';
import { NodeStatsState } from './types';

type NReducer<T> = (state: NodeStatsState, action: T) => NodeStatsState;

// hard code in the nodes for now
const INITIAL_STATE: NodeStatsState = {};

const handleNetworkSwitch: NReducer<NetworkSwitchSucceededAction> = (
  _,
  { payload: { nodeStats } },
) => nodeStats;

const handleWorkerKilled: NReducer<WorkerKilledAction> = (
  state,
  { payload: { nodeId, workerId } },
) => {
  const nodeToChange = state[nodeId];
  const nextNodeNodeStatsState = {
    ...nodeToChange,
    currWorkersById: nodeToChange.currWorkersById.filter(id => id !== workerId),
  };
  return { ...state, [nodeId]: nextNodeNodeStatsState };
};

const handleWorkerSpawned: NReducer<WorkerSpawnedAction> = (
  state,
  { payload: { nodeId, workerId } },
) => {
  const nodeToChange = state[nodeId];
  const nextNodeNodeStatsState = {
    ...nodeToChange,
    currWorkersById: [...nodeToChange.currWorkersById, workerId],
  };
  return { ...state, [nodeId]: nextNodeNodeStatsState };
};

const handleNodeOnline: NReducer<NodeOnlineAction> = (
  state,
  { payload: { nodeId } },
) => ({
  ...state,
  [nodeId]: {
    ...state[nodeId],
    isOffline: false,
  },
});

const handleNodeOffline: NReducer<NodeOfflineAction> = (
  state,
  { payload: { nodeId } },
) => ({
  ...state,
  [nodeId]: {
    ...state[nodeId],
    isOffline: true,
    requestFailures: 0,
  },
});

const handleNodeAdded: NReducer<NodeAddedAction> = (
  state: NodeStatsState,
  { payload: { nodeId, ...nodeStats } },
) => ({ ...state, [nodeId]: { ...nodeStats } });

const handleNodeRemoved: NReducer<NodeRemovedAction> = (state, { payload }) => {
  const stateCopy = { ...state };
  Reflect.deleteProperty(state, payload.nodeId);
  return stateCopy;
};

const handleNodeCallTimeout: NReducer<NodeCallTimeoutAction> = (
  state: NodeStatsState,
  { payload: { nodeId } }: NodeCallTimeoutAction,
) => ({
  ...state,
  [nodeId]: {
    ...state[nodeId],
    requestFailures: state[nodeId].requestFailures + 1,
  },
});

const handleBalancerFlush: NReducer<BalancerFlushAction> = state =>
  Object.entries(state).reduce(
    (obj, [nodeId, nodeStats]) => ({
      ...obj,
      [nodeId]: { ...nodeStats, requestFailures: 0 },
    }),
    {} as NodeStatsState,
  );

export const nodeStats: NReducer<
  NodeAction | WorkerAction | NodeCallAction | BalancerAction
> = (state = INITIAL_STATE, action): NodeStatsState => {
  switch (action.type) {
    case WORKER.KILLED:
      return handleWorkerKilled(state, action);
    case WORKER.SPAWNED:
      return handleWorkerSpawned(state, action);
    case NODE.ONLINE:
      return handleNodeOnline(state, action);
    case NODE.OFFLINE:
      return handleNodeOffline(state, action);
    case NODE.ADDED:
      return handleNodeAdded(state, action);
    case NODE.REMOVED:
      return handleNodeRemoved(state, action);
    case NODE_CALL.TIMEOUT:
      return handleNodeCallTimeout(state, action);
    case BALANCER.FLUSH:
      return handleBalancerFlush(state, action);
    case BALANCER.NETWORK_SWITCH_SUCCEEDED:
      return handleNetworkSwitch(state, action);
    default:
      return state;
  }
};

export default nodeStats;
