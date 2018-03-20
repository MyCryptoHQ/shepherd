import { call, select, put, takeEvery } from 'redux-saga/effects';
import {
  providerAdded,
  ProcessedProvider,
} from '@src/ducks/providerBalancer/providerStats';
import {
  AddProviderConfigAction,
  PROVIDER_CONFIG,
} from '@src/ducks/providerConfigs';
import { getNetwork } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import { processProvider } from '@src/saga/helpers/processing';

function* handleAddingProviderConfig({
  payload: { config, id },
}: AddProviderConfigAction) {
  const network: string = yield select(getNetwork);
  if (network !== config.network) {
    return;
  }

  const processedProvider: ProcessedProvider = yield call(
    processProvider,
    id,
    config,
  );

  yield put(providerAdded(processedProvider));
}

export const addProviderConfigWatcher = [
  takeEvery(PROVIDER_CONFIG.ADD, handleAddingProviderConfig),
];
