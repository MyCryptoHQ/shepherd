import {
  CallRequest,
  EstimateGasRequest,
  GetBalanceRequest,
  GetTransactionCountRequest,
  SendRawTxRequest,
  GetCurrentBlockRequest,
} from './types';
import { hexEncodeData } from './utils';
import { TxObj } from '@src/types';

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

  public estimateGas(transaction): EstimateGasRequest | any {
    return {
      method: 'eth_estimateGas',
      params: [transaction],
    };
  }

  public getBalance(address: string): GetBalanceRequest | any {
    return {
      method: 'eth_getBalance',
      params: [hexEncodeData(address), 'pending'],
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

  public getCurrentBlock(): GetCurrentBlockRequest | any {
    return {
      method: 'eth_blockNumber',
    };
  }
}
