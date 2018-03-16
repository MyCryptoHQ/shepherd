import { IWorker } from '@src/ducks/providerBalancer/workers';
import { StrIdx } from '@src/types';

export interface IProviderStats {
  currWorkersById: string[];
  isOffline: boolean;
  requestFailures: number;
  avgResponseTime: number;
}

export interface ProviderStatsState {
  [providerId: string]: Readonly<IProviderStats>;
}

export enum PROVIDER_STATS {
  ONLINE = 'PROVIDER_STATS_ONLINE',
  OFFLINE = 'PROVIDER_STATS_OFFLINE',
  ADDED = 'PROVIDER_STATS_ADDED',
  REMOVED = 'PROVIDER_STATS_REMOVED',
}

export interface ProviderStatsOnlineAction {
  type: PROVIDER_STATS.ONLINE;
  payload: {
    providerId: string;
  };
}

export interface ProviderStatsOfflineAction {
  type: PROVIDER_STATS.OFFLINE;
  payload: {
    providerId: string;
  };
}

export interface ProviderStatsAddedAction {
  type: PROVIDER_STATS.ADDED;
  payload: {
    providerId: string;
    stats: IProviderStats;
    workers: StrIdx<IWorker>;
  };
}

export type ProcessedProvider = ProviderStatsAddedAction['payload'];

export interface ProviderStatsRemovedAction {
  type: PROVIDER_STATS.REMOVED;
  payload: { providerId: string };
}

export type ProviderStatsAction =
  | ProviderStatsOnlineAction
  | ProviderStatsOfflineAction
  | ProviderStatsAddedAction
  | ProviderStatsRemovedAction;
