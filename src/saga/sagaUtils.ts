import { IProviderCall } from '@src/ducks/providerBalancer/providerCalls';
import {
  IProviderStats,
  ProcessedProvider,
} from '@src/ducks/providerBalancer/providerStats';
import { Task } from 'redux-saga';
import { IWorker } from '@src/ducks/providerBalancer/workers';
import { BalancerNetworkSwitchSucceededAction } from '@src/ducks/providerBalancer/balancerConfig';
import { Workers } from '@src/saga/types';

export const createRetryCall = (
  currentCall: IProviderCall,
  currentProvider: string,
): IProviderCall => {
  const nextCall = {
    ...currentCall,
    // TODO: this can introduce duplicates
    minPriorityProviderList: [
      ...currentCall.minPriorityProviderList,
      currentProvider,
    ],
    numOfRetries: ++currentCall.numOfRetries,
  };

  return nextCall;
};

export const addProviderIdToCall = (
  call: IProviderCall,
  providerId: string,
) => ({
  ...call,
  providerId,
});

export const trackTime = () => {
  const startTime = new Date();
  return {
    end() {
      const endTime = new Date();
      const avgResponseTime = +endTime - +startTime;
      return avgResponseTime;
    },
  };
};

export const makeProviderStats = (
  timer: any,
  isOffline: boolean,
): IProviderStats => ({
  avgResponseTime: timer.end(),
  isOffline,
  currWorkersById: [],
  requestFailures: 0,
});

export const makeWorkerId = (providerId: string, workerNumber: number) =>
  `${providerId}_worker_${workerNumber}`;

export const makeWorker = (providerId: string, task: Task): IWorker => ({
  assignedProvider: providerId,
  currentPayload: null,
  task,
});

/**
 * @description used to differentiate between errors from worker code vs a network call error
 * @param message
 */
export const createInternalError = (message: string) => {
  const e = Error(message);
  e.name = 'InternalError';
  return e;
};

type NetworkPayload = BalancerNetworkSwitchSucceededAction['payload'];

export const reduceProcessedProviders = (
  processedProviders: ProcessedProvider[],
  network: string,
): NetworkPayload => {
  const initialState: NetworkPayload = {
    providerStats: {},
    workers: {},
    network,
  };

  return processedProviders.reduce((accu, currProvider) => {
    const curProviderStats: NetworkPayload['providerStats'] = {
      [currProvider.providerId]: currProvider.stats,
    };

    const providerStats: NetworkPayload['providerStats'] = {
      ...accu.providerStats,
      ...curProviderStats,
    };

    const workers: NetworkPayload['workers'] = {
      ...accu.workers,
      ...currProvider.workers,
    };

    return {
      ...accu,
      providerStats,
      workers,
    };
  }, initialState);
};

export const makeRetVal = (
  error: Error | null = null,
  result: string | null = null,
) => ({ result, error });
