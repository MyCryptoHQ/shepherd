import {
  NodeCallSucceededAction,
  NodeCallTimeoutAction,
  NodeCallAction,
  NODE_CALL,
} from '../nodeCalls/types';
import { Reducer } from 'redux';
import {
  NetworkSwitchSucceededAction,
  BalancerAction,
  BALANCER,
} from '../balancerConfig/types';
import {
  WorkerKilledAction,
  WorkerProcessingAction,
  WorkerAction,
  WORKER,
  WorkerSpawnedAction,
} from '../workers/types';
import { WorkerState } from './types';

type WReducer = Reducer<WorkerState>;
const INITIAL_STATE: WorkerState = {};

const handleNetworkSwitch: WReducer = (
  _: WorkerState,
  { payload }: NetworkSwitchSucceededAction,
) => payload.workers;

const handleWorkerKilled: WReducer = (
  state: WorkerState,
  { payload }: WorkerKilledAction,
) => {
  const stateCopy = { ...state };
  Reflect.deleteProperty(stateCopy, payload.workerId);
  return stateCopy;
};

const handleWorkerProcessing: WReducer = (
  state: WorkerState,
  { payload: { currentPayload, workerId } }: WorkerProcessingAction,
) => ({
  ...state,
  [workerId]: { ...state[workerId], currentPayload },
});

const handleWorkerSpawned: WReducer = (
  state: WorkerState,
  { payload }: WorkerSpawnedAction,
) => ({
  ...state,
  [payload.workerId]: {
    assignedNode: payload.nodeId,
    task: payload.task,
    currentPayload: null,
  },
});

const handleNodeCallSucceeded: WReducer = (
  state: WorkerState,
  { payload }: NodeCallSucceededAction,
) => {
  const { nodeCall: { callId } } = payload;
  const worker = Object.entries(state).find(
    ([_, { currentPayload }]) =>
      currentPayload ? currentPayload.callId === callId : false,
  );
  if (!worker) {
    throw Error(
      `Worker not found for a successful request, this should never happen`,
    );
  }

  const [workerId, workerInst] = worker;

  return { ...state, [workerId]: { ...workerInst, currentPayload: null } };
};

// This is almost the exact same as the above, abstract it
const handleNodeCallTimeout: WReducer = (
  state: WorkerState,
  { payload }: NodeCallTimeoutAction,
) => {
  const { callId } = payload;
  const worker = Object.entries(state).find(
    ([_, { currentPayload }]) =>
      currentPayload ? currentPayload.callId === callId : false,
  );
  if (!worker) {
    throw Error(
      `Worker not found for a successful request, this should never happen`,
    );
  }

  const [workerId, workerInst] = worker;

  return { ...state, [workerId]: { ...workerInst, currentPayload: null } };
};

const workers: WReducer = (
  state: WorkerState = INITIAL_STATE,
  action: WorkerAction | NodeCallAction | BalancerAction,
): WorkerState => {
  switch (action.type) {
    case BALANCER.NETWORK_SWITCH_SUCCEEDED:
      return handleNetworkSwitch(state, action);
    case WORKER.SPAWNED:
      return handleWorkerSpawned(state, action);
    case WORKER.KILLED:
      return handleWorkerKilled(state, action);
    case WORKER.PROCESSING:
      return handleWorkerProcessing(state, action);
    case NODE_CALL.SUCCEEDED:
      return handleNodeCallSucceeded(state, action);
    case NODE_CALL.TIMEOUT:
      return handleNodeCallTimeout(state, action);
    default:
      return state;
  }
};

export default workers;
