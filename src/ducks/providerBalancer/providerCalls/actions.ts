import {
  ProviderCallRequestedAction,
  PROVIDER_CALL,
  ProviderCallTimeoutAction,
  ProviderCallFailedAction,
  ProviderCallSucceededAction,
  ProviderCallFlushedAction,
} from './types';

export const providerCallRequested = (
  payload: ProviderCallRequestedAction['payload'],
): ProviderCallRequestedAction => ({
  type: PROVIDER_CALL.REQUESTED,
  payload,
});

export const providerCallTimeout = (
  payload: ProviderCallTimeoutAction['payload'],
): ProviderCallTimeoutAction => ({
  type: PROVIDER_CALL.TIMEOUT,
  payload,
});

export const providerCallFailed = (
  payload: ProviderCallFailedAction['payload'],
): ProviderCallFailedAction => ({
  type: PROVIDER_CALL.FAILED,
  payload,
});

export const providerCallFlushed = (
  payload: ProviderCallFlushedAction['payload'],
): ProviderCallFlushedAction => ({ type: PROVIDER_CALL.FLUSHED, payload });

export const providerCallSucceeded = (
  payload: ProviderCallSucceededAction['payload'],
): ProviderCallSucceededAction => ({
  type: PROVIDER_CALL.SUCCEEDED,
  payload,
});
