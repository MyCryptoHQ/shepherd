import { IHexStrTransaction } from '@src/types';
import { RPCRequests } from '../rpc/requests';
import {
  ICallRequest,
  IEstimateGasRequest,
  IGetBalanceRequest,
  IGetCurrentBlockRequest,
  IGetTransactionByHashRequest,
  IGetTransactionCountRequest,
  IGetTransactionReceiptRequest,
  ISendRawTxRequest,
} from './types';

export class EtherscanRequests extends RPCRequests {
  public sendRawTx(signedTx: string): ISendRawTxRequest {
    return {
      module: 'proxy',
      action: 'eth_sendRawTransaction',
      hex: signedTx,
    };
  }

  public estimateGas(
    transaction: Pick<
      IHexStrTransaction & { from: string },
      'to' | 'data' | 'from' | 'value'
    >,
  ): IEstimateGasRequest {
    return {
      module: 'proxy',
      action: 'eth_estimateGas',
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      from: transaction.from,
    };
  }

  public getBalance(address: string): IGetBalanceRequest {
    return {
      module: 'account',
      action: 'balance',
      tag: 'latest',
      address,
    };
  }

  public ethCall(
    transaction: Pick<IHexStrTransaction, 'to' | 'data'>,
  ): ICallRequest {
    return {
      module: 'proxy',
      action: 'eth_call',
      to: transaction.to,
      data: transaction.data,
    };
  }

  public getTransactionByHash(txhash: string): IGetTransactionByHashRequest {
    return {
      module: 'proxy',
      action: 'eth_getTransactionByHash',
      txhash,
    };
  }

  public getTransactionReceipt(txhash: string): IGetTransactionReceiptRequest {
    return {
      module: 'proxy',
      action: 'eth_getTransactionReceipt',
      txhash,
    };
  }

  public getTransactionCount(address: string): IGetTransactionCountRequest {
    return {
      module: 'proxy',
      action: 'eth_getTransactionCount',
      tag: 'latest',
      address,
    };
  }

  public getCurrentBlock(): IGetCurrentBlockRequest {
    return {
      module: 'proxy',
      action: 'eth_blockNumber',
    };
  }
}
