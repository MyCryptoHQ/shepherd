import { call, apply, race } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { providerStorage } from '@src/providers';

/**
 * @description polls the offline state of a provider, then returns control to caller when it comes back online
 * @param {string} providerId
 */
export function* checkProviderConnectivity(providerId: string) {
  const provider = providerStorage.getInstance(providerId);
  try {
    console.log(`Polling ${providerId} to see if its online...`);
    const { lb } = yield race({
      lb: apply(provider, provider.getCurrentBlock),
      to: call(delay, 5000),
    });

    return !!lb;
  } catch (error) {
    console.info(error);
  }

  return false;
}
