import {
  providerOnline,
  ProviderOfflineAction,
} from '@src/ducks/providerBalancer/providerStats';
import { ProviderConfig } from '@src/types/providers';
import { call, select, put, apply, race } from 'redux-saga/effects';
import { getProviderConfigById } from '@src/ducks/providerConfigs/configs';
import { delay } from 'redux-saga';
import { getAllMethodsAvailable } from '@src/ducks/providerBalancer/selectors';
import { setOnline } from '@src/ducks/providerBalancer/balancerConfig';

/**
 * @description polls the offline state of a provider, then returns control to caller when it comes back online
 * @param {string} providerId
 */
export function* checkProviderConnectivity(
  providerId: string,
  poll: boolean = true,
) {
  const providerConfig: ProviderConfig = yield select(
    getProviderConfigById,
    providerId,
  );
  while (true) {
    try {
      console.log(`Polling ${providerId} to see if its online...`);
      const { lb } = yield race({
        lb: apply(providerConfig.pLib, providerConfig.pLib.getCurrentBlock),
        to: call(delay, 5000),
      });
      if (lb) {
        console.log(`${providerId} online!`);
        return true;
      }
    } catch (error) {
      console.info(error);

      if (!poll) {
        return false;
      }
      yield call(delay, 5000);
    }
    console.log(`${providerId} still offline`);
  }
}

export function* watchOfflineProvider({
  payload: { providerId },
}: ProviderOfflineAction) {
  yield call(checkProviderConnectivity, providerId);

  yield put(providerOnline({ providerId }));

  // check if all methods are available after this provider is online
  const isAllMethodsAvailable: boolean = yield select(getAllMethodsAvailable);

  // if they are, put app in online state
  if (isAllMethodsAvailable) {
    yield put(setOnline());
  }
}
