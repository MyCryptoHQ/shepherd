import {
  ProviderCallSucceededAction,
  ProviderCallTimeoutAction,
  ProviderCallAction,
  PROVIDER_CALL,
} from '../providerCalls/types';
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
    assignedProvider: payload.providerId,
    task: payload.task,
    currentPayload: null,
  },
});

const handleProviderCallSucceeded: WReducer = (
  state: WorkerState,
  { payload }: ProviderCallSucceededAction,
) => {
  const { providerCall: { callId } } = payload;
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
const handleProviderCallTimeout: WReducer = (
  state: WorkerState,
  { payload }: ProviderCallTimeoutAction,
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
  action: WorkerAction | ProviderCallAction | BalancerAction,
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
    case PROVIDER_CALL.SUCCEEDED:
      return handleProviderCallSucceeded(state, action);
    case PROVIDER_CALL.TIMEOUT:
      return handleProviderCallTimeout(state, action);
    default:
      return state;
  }
};

export default workers;
