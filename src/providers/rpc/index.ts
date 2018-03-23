import { IHexStrTransaction, IProvider, TxObj } from '@src/types';
import { makeBN, Wei } from '@src/utils';
import {
  isValidCallRequest,
  isValidCurrentBlock,
  isValidEstimateGas,
  isValidGetBalance,
  isValidRawTxApi,
  isValidTransactionCount,
} from '@src/validators';
import RPCClient from './client';
import RPCRequests from './requests';

export default class RpcProvider implements IProvider {
  protected client: RPCClient;
  protected requests: RPCRequests;

  constructor(endpoint: string) {
    this.client = new RPCClient(endpoint);
    this.requests = new RPCRequests();
  }

  public ping(): Promise<boolean> {
    return this.client
      .call(this.requests.getNetVersion())
      .then(() => true)
      .catch(() => false);
  }

  public sendCallRequest(txObj: TxObj): Promise<string> {
    return this.client
      .call(this.requests.ethCall(txObj))
      .then(isValidCallRequest)
      .then(response => response.result);
  }

  public getBalance(address: string): Promise<Wei> {
    return this.client
      .call(this.requests.getBalance(address))
      .then(isValidGetBalance)
      .then(({ result }) => Wei(result));
  }

  public estimateGas(transaction: Partial<IHexStrTransaction>): Promise<Wei> {
    return this.client
      .call(this.requests.estimateGas(transaction))
      .then(isValidEstimateGas)
      .then(({ result }) => Wei(result))
      .catch(error => {
        throw new Error(error.message);
      });
  }

  public getTransactionCount(address: string): Promise<string> {
    return this.client
      .call(this.requests.getTransactionCount(address))
      .then(isValidTransactionCount)
      .then(({ result }) => result);
  }

  public getCurrentBlock(): Promise<string> {
    return this.client
      .call(this.requests.getCurrentBlock())
      .then(isValidCurrentBlock)
      .then(({ result }) => makeBN(result).toString());
  }

  public sendRawTx(signedTx: string): Promise<string> {
    return this.client
      .call(this.requests.sendRawTx(signedTx))
      .then(isValidRawTxApi)
      .then(({ result }) => {
        return result;
      });
  }
}
