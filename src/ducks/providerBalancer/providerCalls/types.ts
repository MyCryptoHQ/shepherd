import { AllProviderMethods, StrIdx } from '@src/types';

export type ProviderCallState =
  | SuccessfulProviderCall
  | PendingProviderCall
  | FailedProviderCall;

export type ProviderCallsState = StrIdx<ProviderCallState>;

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

export interface SuccessfulProviderCall extends IProviderCall {
  result: string;
  error: null;
  pending: false;
}

export interface FailedProviderCall extends ProviderCallWithPid {
  result: null;
  error: string;
  pending: false;
}

export interface FlushedProviderCall extends IProviderCall {
  result: null;
  error: string;
  pending: false;
}

export interface PendingProviderCall extends IProviderCall {
  result: null;
  error: null;
  pending: true;
}

export interface ProviderCallRequestedAction {
  type: PROVIDER_CALL.REQUESTED;
  payload: IProviderCall;
}

export interface ProviderCallTimeoutAction {
  type: PROVIDER_CALL.TIMEOUT;
  payload: { error: Error; providerCall: ProviderCallWithPid };
}

export interface ProviderCallFailedAction {
  type: PROVIDER_CALL.FAILED;
  payload: { error: string; providerCall: ProviderCallWithPid };
}

export interface ProviderCallFlushedAction {
  type: PROVIDER_CALL.FLUSHED;
  payload: { error: string; providerCall: IProviderCall };
}

export interface ProviderCallSucceededAction {
  type: PROVIDER_CALL.SUCCEEDED;
  payload: { result: string; providerCall: ProviderCallWithPid };
}

export type ProviderCallAction =
  | ProviderCallRequestedAction
  | ProviderCallTimeoutAction
  | ProviderCallFailedAction
  | ProviderCallSucceededAction
  | ProviderCallFlushedAction;
