import { DeepPartial, StrIdx } from '@src/types';
import { IProviderStats } from '@src/ducks/providerBalancer/providerStats';
import { IWorker } from '@src/ducks/providerBalancer/workers';
import { IProviderCall } from '@src/ducks/providerBalancer/providerCalls';
import { Task } from 'redux-saga';
import { IProviderConfig } from '@src/ducks/providerConfigs';

export const makeMockProviderConfig = (
  options: DeepPartial<IProviderConfig> = {},
): IProviderConfig => {
  const defaultConfig = {
    concurrency: 3,
    network: 'ETH',
    requestFailureThreshold: 3,
    supportedMethods: {
      ping: true,
      sendCallRequest: true,
      getBalance: true,
      estimateGas: true,
      getTransactionCount: true,
      getCurrentBlock: true,
      sendRawTx: true,
    },
    timeoutThresholdMs: 1000,
  };

  return {
    ...defaultConfig,
    ...options,
    supportedMethods: {
      ...defaultConfig.supportedMethods,
      ...(options.supportedMethods ? options.supportedMethods : {}),
    },
  };
};

export const makeMockStats = (
  options: Partial<IProviderStats> = {},
): IProviderStats => {
  const defaultStats: IProviderStats = {
    avgResponseTime: 1,
    currWorkersById: [],
    isOffline: false,
    requestFailures: 0,
  };
  return {
    ...defaultStats,
    ...options,
  };
};

export const makeMockCall = (
  options: Partial<IProviderCall> = {},
): IProviderCall => {
  const defaultCall: IProviderCall = {
    callId: 0,
    minPriorityProviderList: [],
    numOfTimeouts: 0,
    providerId: 'mock1',

    rpcArgs: [],
    rpcMethod: 'ping',
  };

  return {
    ...defaultCall,
    ...options,
  };
};

export const makeMockWorker = (options: Partial<IWorker> = {}): IWorker => {
  const defaultWorker: IWorker = {
    assignedProvider: 'mock1',
    currentPayload: null,
    task: {} as Task,
  };

  return {
    ...defaultWorker,
    ...options,
  };
};

export const makeMockWorkers = (
  providerId: string,
  concurrency: number,
): StrIdx<IWorker> => {
  const workers: StrIdx<IWorker> = {};
  for (let i = 0; i < concurrency; i++) {
    const workerId = `${providerId}_worker_${i}`;
    workers[workerId] = makeMockWorker({
      assignedProvider: providerId,
    });
  }
  return workers;
};
