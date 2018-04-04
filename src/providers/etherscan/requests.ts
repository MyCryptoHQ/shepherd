import { IHexStrTransaction } from '@src/types';
import { RPCRequests } from '../rpc/requests';
import {
  CallRequest,
  EstimateGasRequest,
  GetBalanceRequest,
  GetCurrentBlockRequest,
  GetTransactionByHashRequest,
  GetTransactionCountRequest,
  GetTransactionReceiptRequest,
  SendRawTxRequest,
} from './types';

export class EtherscanRequests extends RPCRequests {
  public sendRawTx(signedTx: string): SendRawTxRequest {
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
  ): EstimateGasRequest {
    return {
      module: 'proxy',
      action: 'eth_estimateGas',
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      from: transaction.from,
    };
  }

  public getBalance(address: string): GetBalanceRequest {
    return {
      module: 'account',
      action: 'balance',
      tag: 'latest',
      address,
    };
  }

  public ethCall(
    transaction: Pick<IHexStrTransaction, 'to' | 'data'>,
  ): CallRequest {
    return {
      module: 'proxy',
      action: 'eth_call',
      to: transaction.to,
      data: transaction.data,
    };
  }

  public getTransactionByHash(txhash: string): GetTransactionByHashRequest {
    return {
      module: 'proxy',
      action: 'eth_getTransactionByHash',
      txhash,
    };
  }

  public getTransactionReceipt(txhash: string): GetTransactionReceiptRequest {
    return {
      module: 'proxy',
      action: 'eth_getTransactionReceipt',
      txhash,
    };
  }

  public getTransactionCount(address: string): GetTransactionCountRequest {
    return {
      module: 'proxy',
      action: 'eth_getTransactionCount',
      tag: 'latest',
      address,
    };
  }

  public getCurrentBlock(): GetCurrentBlockRequest {
    return {
      module: 'proxy',
      action: 'eth_blockNumber',
    };
  }
}
