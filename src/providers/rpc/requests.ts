import { IHexStrTransaction, TxObj } from '@src/types';
import { stripHexPrefix } from '@src/utils';
import {
  ICallRequest,
  IEstimateGasRequest,
  IGetBalanceRequest,
  IGetCodeRequest,
  IGetCurrentBlockRequest,
  IGetNetVersionRequest,
  IGetTransactionByHashRequest,
  IGetTransactionCountRequest,
  IGetTransactionReceiptRequest,
  ISendRawTxRequest,
} from './types';

export class RPCRequests {
  public getNetVersion(): IGetNetVersionRequest | any {
    return { method: 'net_version' };
  }

  public sendRawTx(signedTx: string): ISendRawTxRequest | any {
    return {
      method: 'eth_sendRawTransaction',
      params: [signedTx],
    };
  }

  public estimateGas(
    transaction: Partial<IHexStrTransaction>,
  ): IEstimateGasRequest | any {
    return {
      method: 'eth_estimateGas',
      params: [transaction],
    };
  }

  public getBalance(address: string): IGetBalanceRequest | any {
    return {
      method: 'eth_getBalance',
      params: [`0x${stripHexPrefix(address)}`, 'pending'],
    };
  }

  public ethCall(txObj: TxObj): ICallRequest | any {
    return {
      method: 'eth_call',
      params: [txObj, 'pending'],
    };
  }

  public getTransactionCount(
    address: string,
  ): IGetTransactionCountRequest | any {
    return {
      method: 'eth_getTransactionCount',
      params: [address, 'pending'],
    };
  }

  public getTransactionByHash(
    txhash: string,
  ): IGetTransactionByHashRequest | any {
    return {
      method: 'eth_getTransactionByHash',
      params: [txhash],
    };
  }

  public getTransactionReceipt(
    txhash: string,
  ): IGetTransactionReceiptRequest | any {
    return {
      method: 'eth_getTransactionReceipt',
      params: [txhash],
    };
  }

  public getCurrentBlock(): IGetCurrentBlockRequest | any {
    return {
      method: 'eth_blockNumber',
    };
  }

  public getCode(address: string): IGetCodeRequest | any {
    return {
      method: 'eth_getCode',
      params: [`0x${stripHexPrefix(address)}`, 'pending'],
    };
  }
}
