import { redux } from '@src/';
import { IProviderCall } from '@src/ducks/providerBalancer/providerCalls';
import { IProviderStats } from '@src/ducks/providerBalancer/providerStats';
import { IWorker } from '@src/ducks/providerBalancer/workers';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { DeepPartial, IProviderContructor } from '@src/types';
import { IShepherd } from '@src/types/api';
import { Task } from 'redux-saga';
import { setTimeout } from 'timers';
import { promisify } from 'util';

export const makeMockProviderConfig = (
  options: DeepPartial<IProviderConfig> = {},
): IProviderConfig => {
  const defaultConfig: IProviderConfig = {
    concurrency: 3,
    network: 'ETH',
    requestFailureThreshold: 3,
    supportedMethods: {
      ping: true,
      sendCallRequest: true,
      sendCallRequests: true,
      getBalance: true,
      estimateGas: true,
      getTransactionCount: true,
      getCurrentBlock: true,
      sendRawTx: true,
      getTransactionByHash: true,
      getTransactionReceipt: true,
      getNetVersion: true,
      getBlockByNumber: true,

      /*web3 methods*/
      sendTransaction: true,
      signMessage: true,
    },
    timeoutThresholdMs: 5000,
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
    numOfRetries: 0,
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

export const asyncTimeout = promisify(setTimeout);

export const getAPI = () => {
  type IRedux = typeof redux;

  interface IIndex {
    shepherd: IShepherd;
    redux: IRedux;
  }

  jest.resetModules();
  const API: IIndex = require('../src/index');
  return API;
};

export const MockProviderImplem = (Proxy as any) as IProviderContructor;
