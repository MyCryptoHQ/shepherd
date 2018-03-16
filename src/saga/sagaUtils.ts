import { IProviderCall } from '@src/ducks/providerBalancer/providerCalls';

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
