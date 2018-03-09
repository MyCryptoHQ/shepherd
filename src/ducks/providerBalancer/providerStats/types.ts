export interface IProviderStats {
  currWorkersById: string[];
  isOffline: boolean;
  requestFailures: number;
  avgResponseTime: number;
}

export interface ProviderStatsState {
  [providerId: string]: Readonly<IProviderStats>;
}

export enum PROVIDER {
  ONLINE = 'PROVIDER_ONLINE',
  OFFLINE = 'PROVIDER_OFFLINE',
  ADDED = 'PROVIDER_ADDED',
  REMOVED = 'PROVIDER_REMOVED',
}

export interface ProviderOnlineAction {
  type: PROVIDER.ONLINE;
  payload: {
    providerId: string;
  };
}

export interface ProviderOfflineAction {
  type: PROVIDER.OFFLINE;
  payload: {
    providerId: string;
  };
}

export interface ProviderAddedAction {
  type: PROVIDER.ADDED;
  payload: {
    providerId: string;
  } & IProviderStats;
}

export interface ProviderRemovedAction {
  type: PROVIDER.REMOVED;
  payload: { providerId: string };
}

export type ProviderAction =
  | ProviderOnlineAction
  | ProviderOfflineAction
  | ProviderAddedAction
  | ProviderRemovedAction;
