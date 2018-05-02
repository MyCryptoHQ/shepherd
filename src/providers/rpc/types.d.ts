import {
  IAccountEthSCReq,
  IProxyEthScReq,
} from '@src/providers/etherscan/types';
import { ProviderReq } from '@src/types';
import {
  AnyJsonRpc,
  EthBlockNumber,
  EthCall,
  EthEstimateGas,
  EthGetBalance,
  EthGetTransactionByHash,
  EthGetTransactionCount,
  EthGetTransactionReceipt,
  EthSendRawTransaction,
  ExtractParams,
  NetVersion,
} from 'eth-rpc-types';

type RequestType<
  T extends 'rpc' | 'ethscAccount' | 'ethscProxy',
  U extends AnyJsonRpc<boolean>
> = T extends 'rpc'
  ? ProviderReq<U>
  : T extends 'ethscAccount' ? IAccountEthSCReq<U> : IProxyEthScReq<U>;

export interface IBaseRpcRequests<
  T extends 'rpc' | 'ethscAccount' | 'ethscProxy',
  U extends 'rpc' | 'ethscAccount' | 'ethscProxy'
> {
  getNetVersion(): RequestType<T, NetVersion<false>>;

  getBalance(
    address: ExtractParams<EthGetBalance>[0],
  ): RequestType<U, EthGetBalance>;

  estimateGas(
    tx: ExtractParams<EthEstimateGas>[0],
  ): RequestType<T, EthEstimateGas>;

  getTransactionCount(
    address: ExtractParams<EthGetTransactionCount>[0],
  ): RequestType<T, EthGetTransactionCount>;

  getTransactionByHash(
    txhash: ExtractParams<EthGetTransactionByHash>[0],
  ): RequestType<T, EthGetTransactionByHash>;

  getTransactionReceipt(
    txhash: ExtractParams<EthGetTransactionReceipt>[0],
  ): RequestType<T, EthGetTransactionReceipt>;

  sendRawTx(
    tx: ExtractParams<EthSendRawTransaction>[0],
  ): RequestType<T, EthSendRawTransaction>;

  ethCall(txObj: ExtractParams<EthCall>[0]): RequestType<T, EthCall>;

  getCurrentBlock(): RequestType<T, EthBlockNumber>;
}

export type TRPCRequests = IBaseRpcRequests<'rpc', 'rpc'>;
