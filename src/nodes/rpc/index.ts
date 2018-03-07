import BN from 'bn.js';
import RPCClient from './client';
import RPCRequests from './requests';
import {
  isValidGetBalance,
  isValidEstimateGas,
  isValidCallRequest,
  isValidTransactionCount,
  isValidCurrentBlock,
  isValidRawTxApi,
} from '@src/validators';
import { IHexStrTransaction, INode, TxObj } from '@src/types';
import { Wei, stripHexPrefix } from '@src/ethUnits';

export default class RpcNode implements INode {
  public client: RPCClient;
  public requests: RPCRequests;

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
      .then(({ result }) => new BN(stripHexPrefix(result)).toString());
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
