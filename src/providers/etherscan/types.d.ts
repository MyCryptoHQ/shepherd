import { IBaseRpcRequests } from '@src/providers/rpc/types';
import {
  AnyJsonRpc,
  DefaultBlock,
  ExtractParams,
  ExtractReq,
} from 'eth-rpc-types/primitives';

export declare enum IEtherscanModule {
  PROXY = 'proxy',
  ACCOUNT = 'account',
}

export interface IProxyEthScReq<T extends AnyJsonRpc<boolean>> {
  module: IEtherscanModule.PROXY;
  action: ExtractReq<T>['method'];
  payload: ExtractParams<T> extends [infer U, infer H]
    ? H extends DefaultBlock
      ? U extends string
        ? [{ [propName: string]: U }, { tag: H }]
        : [U, { tag: H }]
      : [U, H]
    : ExtractParams<T> extends [infer U]
      ? U extends DefaultBlock
        ? [{ tag: U }]
        : U extends string ? [{ [propName: string]: U }] : [U]
      : ExtractParams<T>;
}

export interface IAccountEthSCReq<T extends AnyJsonRpc<boolean>> {
  module: IEtherscanModule.ACCOUNT;
  action: 'balance'; // hard coded for now since we only use balance action
  payload: ExtractParams<T> extends [infer U, infer H]
    ? H extends DefaultBlock
      ? U extends string
        ? [{ [propName: string]: U }, { tag: H }]
        : [U, { tag: H }]
      : [U, H]
    : ExtractParams<T> extends [infer U]
      ? U extends DefaultBlock
        ? [{ tag: U }]
        : U extends string ? [{ [propName: string]: U }] : [U]
      : ExtractParams<T>;
}

export type EtherscanRequest = ReturnType<
  IEtherscanRequests[keyof IEtherscanRequests]
>;

export type IEtherscanRequests = IBaseRpcRequests<'ethscProxy', 'ethscAccount'>;
