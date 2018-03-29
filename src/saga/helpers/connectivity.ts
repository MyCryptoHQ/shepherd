import { getProviderTimeoutThreshold } from '@src/ducks/providerConfigs';
import { providerStorage } from '@src/providers/providerStorage';
import { delay } from 'redux-saga';
import { apply, call, race, select } from 'redux-saga/effects';
import { logger } from '@src/utils/logging';

/**
 * @description polls the offline state of a provider, then returns control to caller when it comes back online
 * @param {string} providerId
 */
export function* checkProviderConnectivity(providerId: string) {
  const provider = providerStorage.getInstance(providerId);
  const timeoutThreshold = yield select(
    getProviderTimeoutThreshold,
    providerId,
  );
  try {
    const { lb } = yield race({
      lb: apply(provider, provider.getCurrentBlock),
      to: call(delay, timeoutThreshold),
    });
    return !!lb;
  } catch (error) {
    logger.log(error);
  }
  return false;
}
