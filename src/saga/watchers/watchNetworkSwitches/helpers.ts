import { call, select, all } from 'redux-saga/effects';
import { ProcessedProvider } from '@src/ducks/providerBalancer/providerStats';
import { getAllProvidersOfNetwork } from '@src/ducks/selectors';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { StrIdx } from '@src/types';
import { reduceProcessedProviders } from '@src/saga/sagaUtils';
import { processProvider } from '@src/saga/helpers/processing';

/**
 * @description Gets all of the providers of the requested next network,
 * then creates all of the workers and provider statistics required for a successful switch
 * @param network
 */
export function* initializeNewNetworkProviders(network: string) {
  const providers: StrIdx<IProviderConfig> = yield select(
    getAllProvidersOfNetwork,
    network,
  );

  const providerEntries = Object.entries(providers).map(
    ([providerId, providerConfig]) =>
      call(processProvider, providerId, providerConfig),
  );

  // process adding all providers in parallel
  const processedProviders: ProcessedProvider[] = yield all(providerEntries);
  const networkSwitchPayload = reduceProcessedProviders(
    processedProviders,
    network,
  );

  return networkSwitchPayload;
}
