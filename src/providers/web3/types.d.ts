import { ProviderReq } from '@src/types';
import {
  EthAccounts,
  EthPersonalSign,
  EthSendTransaction,
  ExtractParams,
  ExtractResponse,
  ExtractResult,
  ExtractSuccessResponse,
} from 'eth-rpc-types';

export interface IWeb3Provider {
  sendTransaction(
    tx: ExtractParams<EthSendTransaction>[0],
  ): Promise<ExtractResult<EthSendTransaction>>;
  signMessage(
    msg: ExtractParams<EthPersonalSign<true>>[0],
    fromAddr: ExtractParams<EthPersonalSign<true>>[1],
  ): Promise<ExtractResult<EthPersonalSign<true>>>;
  getAccounts(): Promise<ExtractResult<EthAccounts>>;
}

export interface IWeb3Requests {
  sendTransaction(
    tx: ExtractParams<EthSendTransaction>[0],
  ): ProviderReq<EthSendTransaction>;
  signMessage(
    msg: ExtractParams<EthPersonalSign<true>>[0],
    fromAddr: ExtractParams<EthPersonalSign<true>>[1],
  ): ProviderReq<EthPersonalSign<true>>;
  getAccounts(): ProviderReq<EthAccounts>;
}
