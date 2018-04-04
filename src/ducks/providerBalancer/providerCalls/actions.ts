import {
  IProviderCallFailed,
  IProviderCallFlushed,
  IProviderCallRequested,
  IProviderCallSucceeded,
  IProviderCallTimeout,
  PROVIDER_CALL,
} from './types';

export const providerCallRequested = (
  payload: IProviderCallRequested['payload'],
): IProviderCallRequested => ({
  type: PROVIDER_CALL.REQUESTED,
  payload,
});

export const providerCallTimeout = (
  payload: IProviderCallTimeout['payload'],
): IProviderCallTimeout => ({
  type: PROVIDER_CALL.TIMEOUT,
  payload,
});

export const providerCallFailed = (
  payload: IProviderCallFailed['payload'],
): IProviderCallFailed => ({
  type: PROVIDER_CALL.FAILED,
  payload,
});

export const providerCallFlushed = (
  payload: IProviderCallFlushed['payload'],
): IProviderCallFlushed => ({ type: PROVIDER_CALL.FLUSHED, payload });

export const providerCallSucceeded = (
  payload: IProviderCallSucceeded['payload'],
): IProviderCallSucceeded => ({
  type: PROVIDER_CALL.SUCCEEDED,
  payload,
});
