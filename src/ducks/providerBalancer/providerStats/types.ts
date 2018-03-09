import { AllProviderIds } from '../providerCalls/types';
import RpcProvider from '@src/providers/rpc';

export type IProviderConfig = Pick<
  IProviderStats,
  | 'requestFailureThreshold'
  | 'supportedMethods'
  | 'maxWorkers'
  | 'timeoutThresholdMs'
> & { network: string };

export interface IProviderStats {
  isCustom: boolean;
  maxWorkers: number;
  currWorkersById: string[];
  timeoutThresholdMs: number;
  isOffline: boolean;
  requestFailures: number;
  requestFailureThreshold: number;
  avgResponseTime: number;
  supportedMethods: { [rpcMethod in keyof RpcProvider]: boolean };
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
    providerId: AllProviderIds;
  };
}

export interface ProviderOfflineAction {
  type: PROVIDER.OFFLINE;
  payload: {
    providerId: AllProviderIds;
  };
}

export interface ProviderAddedAction {
  type: PROVIDER.ADDED;
  payload: {
    providerId: AllProviderIds;
  } & IProviderStats;
}

export interface ProviderRemovedAction {
  type: PROVIDER.REMOVED;
  payload: { providerId: AllProviderIds };
}

export type ProviderAction =
  | ProviderOnlineAction
  | ProviderOfflineAction
  | ProviderAddedAction
  | ProviderRemovedAction;
