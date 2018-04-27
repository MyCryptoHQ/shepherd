import { IProviderBalancerState } from '@src/ducks/providerBalancer';
import { IProviderConfigState } from '@src/ducks/providerConfigs';
import { Wei } from '@src/utils';
import * as RPC from 'eth-rpc-types';
import {
  EthAccounts,
  EthBlockNumber,
  EthCall,
  EthEstimateGas,
  EthGetBalance,
  EthSendRawTransaction,
  EthSendTransaction,
  EthSign,
  NetVersion,
} from 'eth-rpc-types/core';
import { EthGetTransactionCount } from 'eth-rpc-types/get-count';
import {
  EthGetTransactionByHash,
  EthGetTransactionReceipt,
} from 'eth-rpc-types/get-transaction';
import {
  AnyJsonRpc,
  DefaultBlock,
  ExcludeRpcVer,
  ExtractParams,
  ExtractReq,
  ExtractResult,
  RpcMethodNames,
} from 'eth-rpc-types/primitives';

export type ProviderReq<T extends AnyJsonRpc<boolean>> = ExcludeRpcVer<
  ExtractReq<T>
>;

export type DeepPartial<T> = Partial<{ [key in keyof T]: Partial<T[key]> }>;

export type Resolve = (value?: {} | PromiseLike<{}> | undefined) => void;

export type Reject = (reason?: any) => void;

export interface IProviderContructor<T = any> {
  new (args?: T): IProvider;
}

export interface IRPCProviderContructor<T = any> {
  new (args?: T): IRPCProvider;
}

type ER<T extends AnyJsonRpc<boolean>> = ExtractResult<T>;
type EP<T extends AnyJsonRpc<boolean>> = ExtractParams<T>;

export interface IBaseProvider {
  getNetVersion(): Promise<ER<NetVersion<false>>>;

  ping(): Promise<boolean>;

  getBalance(address: EP<EthGetBalance>[0]): Promise<Wei>;

  estimateGas(tx: EP<EthEstimateGas>[0]): Promise<Wei>;

  getTransactionCount(
    address: EP<EthGetTransactionCount>[0],
  ): Promise<ER<EthGetTransactionCount>>;

  getTransactionByHash(
    txhash: EP<EthGetTransactionByHash>[0],
  ): Promise<ER<EthGetTransactionByHash>>;

  getTransactionReceipt(
    txhash: EP<EthGetTransactionReceipt>[0],
  ): Promise<ER<EthGetTransactionReceipt>>;

  sendRawTx(
    tx: EP<EthSendRawTransaction>[0],
  ): Promise<ER<EthSendRawTransaction>>;

  sendCallRequest(txObj: EP<EthCall>[0]): Promise<ER<EthCall>>;

  sendCallRequests(txObjs: EP<EthCall>[0][]): Promise<ER<EthCall>[]>;

  getCurrentBlock(): Promise<ER<EthBlockNumber>>;
}

export declare enum IEtherscanModule {
  PROXY = 'proxy',
  ACCOUNT = 'account',
}

interface IProxyEthScReq<T extends AnyJsonRpc<boolean>> {
  module: IEtherscanModule.PROXY;
  action: ExtractReq<T>['method'];
  payload: EP<T> extends [infer U, infer H]
    ? H extends DefaultBlock
      ? U extends string
        ? [{ [propName: string]: U }, { tag: H }]
        : [U, { tag: H }]
      : [U, H]
    : EP<T> extends [infer U]
      ? U extends DefaultBlock
        ? [{ tag: U }]
        : U extends string ? [{ [propName: string]: U }] : [U]
      : EP<T>;
}

interface IAccountEthSCReq<T extends AnyJsonRpc<boolean>> {
  module: IEtherscanModule.ACCOUNT;
  action: 'balance'; // hard coded for now since we only use balance action
  payload: EP<T> extends [infer U, infer H]
    ? H extends DefaultBlock
      ? U extends string
        ? [{ [propName: string]: U }, { tag: H }]
        : [U, { tag: H }]
      : [U, H]
    : EP<T> extends [infer U]
      ? U extends DefaultBlock
        ? [{ tag: U }]
        : U extends string ? [{ [propName: string]: U }] : [U]
      : EP<T>;
}

export interface IEtherscanRequests {
  getBalance(address: EP<EthGetBalance>[0]): IAccountEthSCReq<EthGetBalance>;

  estimateGas(tx: EP<EthEstimateGas>[0]): IProxyEthScReq<EthEstimateGas>;

  getTransactionCount(
    address: EP<EthGetTransactionCount>[0],
  ): IProxyEthScReq<EthGetTransactionCount>;

  getTransactionByHash(
    txhash: EP<EthGetTransactionByHash>[0],
  ): IProxyEthScReq<EthGetTransactionByHash>;

  getTransactionReceipt(
    txhash: EP<EthGetTransactionReceipt>[0],
  ): IProxyEthScReq<EthGetTransactionReceipt>;

  sendRawTx(
    tx: EP<EthSendRawTransaction>[0],
  ): IProxyEthScReq<EthSendRawTransaction>;

  ethCall(txObj: EP<EthCall>[0]): IProxyEthScReq<EthCall>;

  getCurrentBlock(): IProxyEthScReq<EthBlockNumber>;
}

export interface IRPCRequests {
  getNetVersion(): ProviderReq<NetVersion<false>>;

  getBalance(address: EP<EthGetBalance>[0]): ProviderReq<EthGetBalance>;

  estimateGas(tx: EP<EthEstimateGas>[0]): ProviderReq<EthEstimateGas>;

  getTransactionCount(
    address: EP<EthGetTransactionCount>[0],
  ): ProviderReq<EthGetTransactionCount>;

  getTransactionByHash(
    txhash: EP<EthGetTransactionByHash>[0],
  ): ProviderReq<EthGetTransactionByHash>;

  getTransactionReceipt(
    txhash: EP<EthGetTransactionReceipt>[0],
  ): ProviderReq<EthGetTransactionReceipt>;

  sendRawTx(
    tx: EP<EthSendRawTransaction>[0],
  ): ProviderReq<EthSendRawTransaction>;

  ethCall(txObj: EP<EthCall>[0]): ProviderReq<EthCall>;

  getCurrentBlock(): ProviderReq<EthBlockNumber>;
}

export interface IWeb3Requests {
  sendTransaction(
    tx: EP<EthSendTransaction>[0],
  ): ProviderReq<EthSendTransaction>;
  signMessage(
    msg: EP<EthSign>[0],
    fromAddr: EP<EthSign>[1],
  ): ProviderReq<EthSign>;
  getAccounts(): ProviderReq<EthAccounts>;
}

export interface IRPCProvider {
  getNetVersion: RPC.NetVersion;
  getBalance: RPC.EthGetBalance;
  estimateGas: RPC.EthEstimateGas;
  getTransactionCount: RPC.EthGetTransactionCount;
  getTransactionByHash: RPC.EthGetTransactionByHash;
  getTransactionReceipt: RPC.EthGetTransactionReceipt;
  sendRawTx: RPC.EthSendRawTransaction;
  sendCallRequest: RPC.EthCall;
  getCurrentBlock: RPC.EthBlockNumber;
}

export interface IProvider extends IRPCProvider {
  /*Web3 methods*/
  sendTransaction(
    tx: ExtractParams<EthSendTransaction>[0],
  ): Promise<ExtractResult<EthSendTransaction>>;
  signMessage(msgHex: string, fromAddr: string): Promise<string>;
}

export type AllProviderMethods = keyof IProvider;

export interface StrIdx<T> { [key: string]: T }

export interface RootState {
  providerBalancer: IProviderBalancerState;
  providerConfigs: IProviderConfigState;
}
