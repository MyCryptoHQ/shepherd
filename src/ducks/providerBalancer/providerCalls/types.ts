import { AllProviderMethods, IStrIdx } from '@src/types';

export type ProviderCallState =
  | ISuccessfulProviderCall
  | IPendingProviderCall
  | IFailedProviderCall;

export type ProviderCallsState = IStrIdx<ProviderCallState>;

export enum PROVIDER_CALL {
  REQUESTED = 'PROVIDER_CALL_REQUESTED',
  TIMEOUT = 'PROVIDER_CALL_TIMEOUT',
  SUCCEEDED = 'PROVIDER_CALL_SUCCEEDED',
  FAILED = 'PROVIDER_CALL_FAILED',
  FLUSHED = 'PROVIDER_CALL_FLUSHED',
}

export interface IProviderCall {
  callId: number;
  rpcMethod: AllProviderMethods;
  rpcArgs: string[];
  numOfRetries: number;
  minPriorityProviderList: string[];
  providerWhiteList?: string[];
  providerId?: string;
}

export type ProviderCallWithPid = IProviderCall & { providerId: string };

export interface ISuccessfulProviderCall extends IProviderCall {
  result: string;
  error: null;
  pending: false;
}

export interface IFailedProviderCall extends ProviderCallWithPid {
  result: null;
  error: string;
  pending: false;
}

export interface IFlushedProviderCall extends IProviderCall {
  result: null;
  error: string;
  pending: false;
}

export interface IPendingProviderCall extends IProviderCall {
  result: null;
  error: null;
  pending: true;
}

export interface IProviderCallRequested {
  type: PROVIDER_CALL.REQUESTED;
  payload: IProviderCall;
}

export interface IProviderCallTimeout {
  type: PROVIDER_CALL.TIMEOUT;
  payload: { error: Error; providerCall: ProviderCallWithPid };
}

export interface IProviderCallFailed {
  type: PROVIDER_CALL.FAILED;
  payload: { error: string; providerCall: ProviderCallWithPid };
}

export interface IProviderCallFlushed {
  type: PROVIDER_CALL.FLUSHED;
  payload: { error: string; providerCall: IProviderCall };
}

export interface IProviderCallSucceeded {
  type: PROVIDER_CALL.SUCCEEDED;
  payload: { result: string; providerCall: ProviderCallWithPid };
}

export type ProviderCallAction =
  | IProviderCallRequested
  | IProviderCallTimeout
  | IProviderCallFailed
  | IProviderCallSucceeded
  | IProviderCallFlushed;
