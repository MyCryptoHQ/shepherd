import RpcProvider from '@src/providers/rpc';
import { StrIdx } from '@src/types';

export type ProviderCallsState = StrIdx<
  SuccessfulProviderCall | PendingProviderCall | FailedProviderCall
>;

export enum PROVIDER_CALL {
  REQUESTED = 'PROVIDER_CALL_REQUESTED',
  TIMEOUT = 'PROVIDER_CALL_TIMEOUT',
  SUCCEEDED = 'PROVIDER_CALL_SUCCEEDED',
  FAILED = 'PROVIDER_CALL_FAILED',
}

export interface IProviderCall {
  callId: number;
  rpcMethod: keyof RpcProvider;
  rpcArgs: string[];
  numOfTimeouts: number;
  minPriorityProviderList: string[];
  providerWhiteList?: string[];
  providerId?: string;
}

export interface SuccessfulProviderCall extends IProviderCall {
  result: string;
  error: null;
  pending: false;
}

export interface FailedProviderCall extends IProviderCall {
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
  payload: { providerId: string; error: Error; providerCall: IProviderCall };
}

export interface ProviderCallFailedAction {
  type: PROVIDER_CALL.FAILED;
  payload: { error: string; providerCall: IProviderCall };
}

export interface ProviderCallSucceededAction {
  type: PROVIDER_CALL.SUCCEEDED;
  payload: { result: string; providerCall: IProviderCall };
}

export type ProviderCallAction =
  | ProviderCallRequestedAction
  | ProviderCallTimeoutAction
  | ProviderCallFailedAction
  | ProviderCallSucceededAction;