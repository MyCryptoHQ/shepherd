import {
  BalancerNetworkSwitchSucceededAction,
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
  ProviderOnlineAction,
  ProviderOfflineAction,
  ProviderAddedAction,
  ProviderRemovedAction,
  PROVIDER,
  ProviderAction,
} from './types';
import {
  ProviderCallTimeoutAction,
  ProviderCallAction,
  PROVIDER_CALL,
} from '../providerCalls/types';
import { ProviderStatsState } from './types';

type NReducer<T> = (state: ProviderStatsState, action: T) => ProviderStatsState;

// hard code in the providers for now
const INITIAL_STATE: ProviderStatsState = {};

const handleNetworkSwitch: NReducer<BalancerNetworkSwitchSucceededAction> = (
  _,
  { payload: { providerStats } },
) => providerStats;

const handleWorkerKilled: NReducer<WorkerKilledAction> = (
  state,
  { payload: { providerId, workerId } },
) => {
  const providerToChange = state[providerId];
  const nextProviderProviderStatsState = {
    ...providerToChange,
    currWorkersById: providerToChange.currWorkersById.filter(
      id => id !== workerId,
    ),
  };
  return { ...state, [providerId]: nextProviderProviderStatsState };
};

const handleWorkerSpawned: NReducer<WorkerSpawnedAction> = (
  state,
  { payload: { providerId, workerId } },
) => {
  const providerToChange = state[providerId];
  const nextProviderProviderStatsState = {
    ...providerToChange,
    currWorkersById: [...providerToChange.currWorkersById, workerId],
  };
  return { ...state, [providerId]: nextProviderProviderStatsState };
};

const handleProviderOnline: NReducer<ProviderOnlineAction> = (
  state,
  { payload: { providerId } },
) => ({
  ...state,
  [providerId]: {
    ...state[providerId],
    isOffline: false,
  },
});

const handleProviderOffline: NReducer<ProviderOfflineAction> = (
  state,
  { payload: { providerId } },
) => ({
  ...state,
  [providerId]: {
    ...state[providerId],
    isOffline: true,
    requestFailures: 0,
  },
});

const handleProviderAdded: NReducer<ProviderAddedAction> = (
  state: ProviderStatsState,
  { payload: { providerId, ...providerStats } },
) => ({ ...state, [providerId]: { ...providerStats } });

const handleProviderRemoved: NReducer<ProviderRemovedAction> = (
  state,
  { payload },
) => {
  const stateCopy = { ...state };
  Reflect.deleteProperty(state, payload.providerId);
  return stateCopy;
};

const handleProviderCallTimeout: NReducer<ProviderCallTimeoutAction> = (
  state: ProviderStatsState,
  { payload: { providerId } }: ProviderCallTimeoutAction,
) => ({
  ...state,
  [providerId]: {
    ...state[providerId],
    requestFailures: state[providerId].requestFailures + 1,
  },
});

const handleBalancerFlush: NReducer<BalancerFlushAction> = state =>
  Object.entries(state).reduce<ProviderStatsState>(
    (obj, [providerId, providerStats]) => ({
      ...obj,
      [providerId]: { ...providerStats, requestFailures: 0 },
    }),
    {},
  );

export const providerStats: NReducer<
  ProviderAction | WorkerAction | ProviderCallAction | BalancerAction
> = (state = INITIAL_STATE, action): ProviderStatsState => {
  switch (action.type) {
    case WORKER.KILLED:
      return handleWorkerKilled(state, action);
    case WORKER.SPAWNED:
      return handleWorkerSpawned(state, action);
    case PROVIDER.ONLINE:
      return handleProviderOnline(state, action);
    case PROVIDER.OFFLINE:
      return handleProviderOffline(state, action);
    case PROVIDER.ADDED:
      return handleProviderAdded(state, action);
    case PROVIDER.REMOVED:
      return handleProviderRemoved(state, action);
    case PROVIDER_CALL.TIMEOUT:
      return handleProviderCallTimeout(state, action);
    case BALANCER.FLUSH:
      return handleBalancerFlush(state, action);
    case BALANCER.NETWORK_SWITCH_SUCCEEDED:
      return handleNetworkSwitch(state, action);
    default:
      return state;
  }
};

export default providerStats;
