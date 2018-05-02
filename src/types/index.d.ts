import { IProviderBalancerState } from '@src/ducks/providerBalancer';
import { IProviderConfigState } from '@src/ducks/providerConfigs';
import {
  IAccountEthSCReq,
  IProxyEthScReq,
} from '@src/providers/etherscan/types';
import { Wei } from '@src/utils';
import * as RPC from 'eth-rpc-types';
import {
  EthAccounts,
  EthBlockNumber,
  EthCall,
  EthEstimateGas,
  EthGetBalance,
  EthPersonalSign,
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
  ExtractResponse,
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

export interface IProvider extends IRPCProvider {
  /*Web3 methods*/
  sendTransaction(
    tx: ExtractParams<EthSendTransaction>[0],
  ): Promise<ExtractResult<EthSendTransaction>>;
  signMessage(msgHex: string, fromAddr: string): Promise<string>;
}

export type AllProviderMethods = keyof IProvider;

export interface IStrIdx<T> {
  [key: string]: T;
}

export interface IRootState {
  providerBalancer: IProviderBalancerState;
  providerConfigs: IProviderConfigState;
}
