import {
  BALANCER,
  BalancerAction,
  IBalancerFlush,
  IBalancerNetworkSwitchSucceeded,
} from '../balancerConfig/types';
import {
  IProviderCallTimeout,
  PROVIDER_CALL,
  ProviderCallAction,
} from '../providerCalls/types';
import {
  IWorkerKilled,
  IWorkerSpawned,
  WORKER,
  WorkerAction,
} from '../workers/types';
import {
  IProviderStatsAdded,
  IProviderStatsOffline,
  IProviderStatsOnline,
  IProviderStatsRemoved,
  IProviderStatsState,
  PROVIDER_STATS,
  ProviderStatsAction,
} from './types';

type NReducer<T> = (
  state: IProviderStatsState,
  action: T,
) => IProviderStatsState;

const INITIAL_STATE: IProviderStatsState = {};

const handleNetworkSwitch: NReducer<IBalancerNetworkSwitchSucceeded> = (
  _,
  { payload: { providerStats } },
) => {
  for (const [providerId, provider] of Object.entries(providerStats)) {
    if (provider.avgResponseTime < 0) {
      throw Error(`Provider ${providerId} has a response time of below 0`);
    }
    if (provider.requestFailures !== 0) {
      throw Error(`Provider ${providerId} has non-zero request failures`);
    }
  }

  return providerStats;
};

const handleWorkerKilled: NReducer<IWorkerKilled> = (
  state,
  { payload: { providerId, workerId } },
) => {
  const providerToChange = state[providerId];
  if (!providerToChange) {
    throw Error(`Provider ${providerId} does not exist`);
  }

  if (!providerToChange.currWorkersById.includes(workerId)) {
    throw Error(`Worker ${workerId} does not exist`);
  }

  const nextProviderProviderStatsState = {
    ...providerToChange,
    currWorkersById: providerToChange.currWorkersById.filter(
      id => id !== workerId,
    ),
  };
  return { ...state, [providerId]: nextProviderProviderStatsState };
};

const handleWorkerSpawned: NReducer<IWorkerSpawned> = (
  state,
  { payload: { providerId, workerId } },
) => {
  // check for existence of provider
  const providerToChange = state[providerId];
  if (!providerToChange) {
    throw Error(`Provider ${providerId} does not exist`);
  }

  // check for duplicates
  if (providerToChange.currWorkersById.includes(workerId)) {
    throw Error(`Worker ${workerId} already exists`);
  }

  const nextProviderProviderStatsState = {
    ...providerToChange,
    currWorkersById: [...providerToChange.currWorkersById, workerId],
  };
  return { ...state, [providerId]: nextProviderProviderStatsState };
};

const handleProviderOnline: NReducer<IProviderStatsOnline> = (
  state,
  { payload: { providerId } },
) => {
  // check for existence of provider
  const providerToChange = state[providerId];
  if (!providerToChange) {
    throw Error(`Provider ${providerId} does not exist`);
  }

  return {
    ...state,
    [providerId]: {
      ...providerToChange,
      isOffline: false,
    },
  };
};

const handleProviderOffline: NReducer<IProviderStatsOffline> = (
  state,
  { payload: { providerId } },
) => {
  // check for existence of provider
  const providerToChange = state[providerId];
  if (!providerToChange) {
    // done for initialization phase
    return state;
  }

  return {
    ...state,
    [providerId]: {
      ...providerToChange,
      isOffline: true,
      requestFailures: 0,
    },
  };
};

const handleProviderAdded: NReducer<IProviderStatsAdded> = (
  state: IProviderStatsState,
  { payload: { providerId, stats } },
) => {
  if (state[providerId]) {
    throw Error(`Provider ${providerId} already exists`);
  }

  return { ...state, [providerId]: stats };
};

const handleProviderRemoved: NReducer<IProviderStatsRemoved> = (
  state,
  { payload },
) => {
  if (!state[payload.providerId]) {
    throw Error(`Provider ${payload.providerId} does not exist`);
  }
  const stateCopy = { ...state };
  Reflect.deleteProperty(stateCopy, payload.providerId);
  return stateCopy;
};

const handleProviderCallTimeout: NReducer<IProviderCallTimeout> = (
  state: IProviderStatsState,
  { payload: { providerCall: { providerId } } }: IProviderCallTimeout,
) => {
  // check for existence of provider
  const providerToChange = state[providerId];
  if (!providerToChange) {
    throw Error(`Provider ${providerId} does not exist`);
  }

  return {
    ...state,
    [providerId]: {
      ...providerToChange,
      requestFailures: providerToChange.requestFailures + 1,
    },
  };
};

const handleBalancerFlush: NReducer<IBalancerFlush> = state =>
  Object.entries(state).reduce<IProviderStatsState>(
    (obj, [providerId, stats]) => ({
      ...obj,
      [providerId]: { ...stats, requestFailures: 0 },
    }),
    {},
  );

export const providerStatsReducer: NReducer<
  ProviderStatsAction | WorkerAction | ProviderCallAction | BalancerAction
> = (state = INITIAL_STATE, action): IProviderStatsState => {
  switch (action.type) {
    case WORKER.KILLED:
      return handleWorkerKilled(state, action);
    case WORKER.SPAWNED:
      return handleWorkerSpawned(state, action);
    case PROVIDER_STATS.ONLINE:
      return handleProviderOnline(state, action);
    case PROVIDER_STATS.OFFLINE:
      return handleProviderOffline(state, action);
    case PROVIDER_STATS.ADDED:
      return handleProviderAdded(state, action);
    case PROVIDER_STATS.REMOVED:
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
