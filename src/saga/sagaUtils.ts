import { BalancerNetworkSwitchSucceededAction } from '@src/ducks/providerBalancer/balancerConfig';
import {
  IProviderCall,
  ProviderCallWithPid,
} from '@src/ducks/providerBalancer/providerCalls';
import {
  IProviderStats,
  ProcessedProvider,
} from '@src/ducks/providerBalancer/providerStats';
import { IWorker } from '@src/ducks/providerBalancer/workers';
import { Task } from 'redux-saga';

export const createRetryCall = (
  currentCall: ProviderCallWithPid,
): IProviderCall => {
  const { providerId } = currentCall;
  const currMinList = currentCall.minPriorityProviderList;
  const nextMinPriorityList = currMinList.includes(providerId)
    ? currMinList
    : [...currMinList, providerId];

  const nextCall = {
    ...currentCall,
    minPriorityProviderList: nextMinPriorityList,
    numOfRetries: ++currentCall.numOfRetries,
  };

  return nextCall;
};

export const addProviderIdToCall = (
  call: IProviderCall,
  providerId: string,
): ProviderCallWithPid => ({
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
