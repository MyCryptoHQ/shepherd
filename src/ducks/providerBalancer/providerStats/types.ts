import { IWorker } from '@src/ducks/providerBalancer/workers';
import { IStrIdx } from '@src/types';

export interface IProviderStats {
  currWorkersById: string[];
  isOffline: boolean;
  requestFailures: number;
  avgResponseTime: number;
}

export interface IProviderStatsState {
  [providerId: string]: Readonly<IProviderStats>;
}

export enum PROVIDER_STATS {
  ONLINE = 'PROVIDER_STATS_ONLINE',
  OFFLINE = 'PROVIDER_STATS_OFFLINE',
  ADDED = 'PROVIDER_STATS_ADDED',
  REMOVED = 'PROVIDER_STATS_REMOVED',
}

export interface IProviderStatsOnline {
  type: PROVIDER_STATS.ONLINE;
  payload: {
    providerId: string;
  };
}

export interface IProviderStatsOffline {
  type: PROVIDER_STATS.OFFLINE;
  payload: {
    providerId: string;
  };
}

export interface IProviderStatsAdded {
  type: PROVIDER_STATS.ADDED;
  payload: {
    providerId: string;
    stats: IProviderStats;
    workers: IStrIdx<IWorker>;
  };
}

export type ProcessedProvider = IProviderStatsAdded['payload'];

export interface IProviderStatsRemoved {
  type: PROVIDER_STATS.REMOVED;
  payload: { providerId: string };
}

export type ProviderStatsAction =
  | IProviderStatsOnline
  | IProviderStatsOffline
  | IProviderStatsAdded
  | IProviderStatsRemoved;
