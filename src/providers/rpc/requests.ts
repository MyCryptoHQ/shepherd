import { IHexStrTransaction, TxObj } from '@src/types';
import { stripHexPrefix } from '@src/utils';
import {
  CallRequest,
  EstimateGasRequest,
  GetBalanceRequest,
  GetCurrentBlockRequest,
  GetTransactionCountRequest,
  SendRawTxRequest,
  GetTransactionByHashRequest,
  GetTransactionReceiptRequest,
} from './types';

export default class RPCRequests {
  public getNetVersion() {
    return { method: 'net_version' };
  }

  public sendRawTx(signedTx: string): SendRawTxRequest | any {
    return {
      method: 'eth_sendRawTransaction',
      params: [signedTx],
    };
  }

  public estimateGas(
    transaction: Partial<IHexStrTransaction>,
  ): EstimateGasRequest | any {
    return {
      method: 'eth_estimateGas',
      params: [transaction],
    };
  }

  public getBalance(address: string): GetBalanceRequest | any {
    return {
      method: 'eth_getBalance',
      params: [`0x${stripHexPrefix(address)}`, 'pending'],
    };
  }

  public ethCall(txObj: TxObj): CallRequest | any {
    return {
      method: 'eth_call',
      params: [txObj, 'pending'],
    };
  }

  public getTransactionCount(
    address: string,
  ): GetTransactionCountRequest | any {
    return {
      method: 'eth_getTransactionCount',
      params: [address, 'pending'],
    };
  }

  public getTransactionByHash(
    txhash: string,
  ): GetTransactionByHashRequest | any {
    return {
      method: 'eth_getTransactionByHash',
      params: [txhash],
    };
  }

  public getTransactionReceipt(
    txhash: string,
  ): GetTransactionReceiptRequest | any {
    return {
      method: 'eth_getTransactionReceipt',
      params: [txhash],
    };
  }

  public getCurrentBlock(): GetCurrentBlockRequest | any {
    return {
      method: 'eth_blockNumber',
    };
  }
}
