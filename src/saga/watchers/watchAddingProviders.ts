import { BALANCER } from '@src/ducks/providerBalancer/balancerConfig';
import { getNetwork } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { ProcessedProvider } from '@src/ducks/providerBalancer/providerStats';
import { providerAdded } from '@src/ducks/providerBalancer/providerStats';
import {
  AddProviderConfigAction,
  PROVIDER_CONFIG,
} from '@src/ducks/providerConfigs/types';
import { processProvider } from '@src/saga/helpers/processing';
import { call, put, race, select, take, takeEvery } from 'redux-saga/effects';

function* handleAddingProviderConfig({
  payload: { config, id },
}: AddProviderConfigAction) {
  const network: string = yield select(getNetwork);
  if (network !== config.network) {
    return;
  }

  const {
    processedProvider,
  }: { processedProvider: ProcessedProvider } = yield race({
    processedProvider: call(processProvider, id, config),
    cancelled: take(BALANCER.NETWORK_SWTICH_REQUESTED),
  });

  if (!processedProvider) {
    return;
  }

  yield put(providerAdded(processedProvider));
}

export const addProviderConfigWatcher = [
  takeEvery(PROVIDER_CONFIG.ADD, handleAddingProviderConfig),
];
