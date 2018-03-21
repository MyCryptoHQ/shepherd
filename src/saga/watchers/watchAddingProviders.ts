import { call, select, put, takeEvery, race, take } from 'redux-saga/effects';
import { getNetwork } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { processProvider } from '@src/saga/helpers/processing';
import {
  providerAdded,
  ProcessedProvider,
} from '@src/ducks/providerBalancer/providerStats';
import {
  AddProviderConfigAction,
  PROVIDER_CONFIG,
} from '@src/ducks/providerConfigs';
import { BALANCER } from '@src/ducks/providerBalancer/balancerConfig';

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
    console.log(`Provider ${id} cancelled due to network switch`);
    return;
  }

  yield put(providerAdded(processedProvider));
}

export const addProviderConfigWatcher = [
  takeEvery(PROVIDER_CONFIG.ADD, handleAddingProviderConfig),
];
