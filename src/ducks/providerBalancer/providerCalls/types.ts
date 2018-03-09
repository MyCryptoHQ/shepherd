import { StaticProviderId } from '@src/types/providers';
import RpcProvider from '@src/providers/rpc';

export type AllProviderIds = StaticProviderId | string;

export interface ProviderCallsState {
  [callId: string]:
    | SuccessfulProviderCall
    | PendingProviderCall
    | FailedProviderCall;
}

export enum PROVIDER_CALL {
  REQUESTED = 'PROVIDER_CALL_REQUESTED',
  TIMEOUT = 'PROVIDER_CALL_TIMEOUT',
  SUCCEEDED = 'PROVIDER_CALL_SUCCEEDED',
  FAILED = 'PROVIDER_CALL_FAILED',
}

export interface ProviderCall {
  callId: number;
  rpcMethod: keyof RpcProvider;
  rpcArgs: string[];
  numOfTimeouts: number;
  minPriorityProviderList: AllProviderIds[];
  providerWhiteList?: AllProviderIds[];
  providerId?: string;
}

export interface SuccessfulProviderCall extends ProviderCall {
  result: string;
  error: null;
  pending: false;
}

export interface FailedProviderCall extends ProviderCall {
  result: null;
  error: string;
  pending: false;
}

export interface PendingProviderCall extends ProviderCall {
  result: null;
  error: null;
  pending: true;
}

export interface ProviderCallRequestedAction {
  type: PROVIDER_CALL.REQUESTED;
  payload: ProviderCall;
}

export interface ProviderCallTimeoutAction {
  type: PROVIDER_CALL.TIMEOUT;
  payload: ProviderCall & { providerId: AllProviderIds; error: Error };
}

export interface ProviderCallFailedAction {
  type: PROVIDER_CALL.FAILED;
  payload: { error: string; providerCall: ProviderCall };
}

export interface ProviderCallSucceededAction {
  type: PROVIDER_CALL.SUCCEEDED;
  payload: { result: string; providerCall: ProviderCall };
}

export type ProviderCallAction =
  | ProviderCallRequestedAction
  | ProviderCallTimeoutAction
  | ProviderCallFailedAction
  | ProviderCallSucceededAction;
