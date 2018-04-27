import { IBaseProvider } from '@src/types';
import { hexToNumber, makeBN, Wei } from '@src/utils';
import {
  isValidCallRequest,
  isValidCurrentBlock,
  isValidEstimateGas,
  isValidGetBalance,
  isValidRawTxApi,
  isValidTransactionByHash,
  isValidTransactionCount,
  isValidTransactionReceipt,
} from '@src/validators';
import { RPCClient } from './client';
import { RPCRequests } from './requests';

export class RPCProvider implements IBaseProvider {
  protected client: RPCClient;
  protected requests: RPCRequests;

  constructor(endpoint: string) {
    this.client = new RPCClient(endpoint);
    this.requests = new RPCRequests();
  }

  public getNetVersion: IBaseProvider['getNetVersion'] = () =>
    this.client
      .call(this.requests.getNetVersion())
      .then(({ result }) => result);

  public ping: IBaseProvider['ping'] = () =>
    this.client
      .call(this.requests.getNetVersion())
      .then(() => true)
      .catch(() => false);

  public sendCallRequest: IBaseProvider['sendCallRequest'] = txObj =>
    this.client
      .call(this.requests.ethCall(txObj))
      .then(isValidCallRequest)
      .then(response => response.result);

  public sendCallRequests: IBaseProvider['sendCallRequests'] = txObjs =>
    this.client
      .batch(txObjs.map(this.requests.ethCall))
      .then(r => r.map(isValidCallRequest))
      .then(r => r.map(({ result }) => result));

  public getBalance: IBaseProvider['getBalance'] = address =>
    this.client
      .call(this.requests.getBalance(address))
      .then(isValidGetBalance)
      .then(({ result }) => Wei(result));

  public estimateGas: IBaseProvider['estimateGas'] = transaction =>
    this.client
      .call(this.requests.estimateGas(transaction))
      .then(isValidEstimateGas)
      .then(({ result }) => Wei(result))
      .catch(error => {
        throw new Error(error.message);
      });

  public getTransactionCount: IBaseProvider['getTransactionCount'] = address =>
    this.client
      .call(this.requests.getTransactionCount(address))
      .then(isValidTransactionCount)
      .then(({ result }) => result);

  public getCurrentBlock: IBaseProvider['getCurrentBlock'] = () =>
    this.client
      .call(this.requests.getCurrentBlock())
      .then(isValidCurrentBlock)
      .then(({ result }) => makeBN(result).toString());

  public sendRawTx: IBaseProvider['sendRawTx'] = signedTx =>
    this.client
      .call(this.requests.sendRawTx(signedTx))
      .then(isValidRawTxApi)
      .then(({ result }) => result);

  public getTransactionByHash: IBaseProvider['getTransactionByHash'] = txhash =>
    this.client
      .call(this.requests.getTransactionByHash(txhash))
      .then(isValidTransactionByHash)
      .then(({ result }) => ({
        ...result,
        to: result.to || '0x0',
        value: Wei(result.value),
        gasPrice: Wei(result.gasPrice),
        gas: Wei(result.gas),
        nonce: hexToNumber(result.nonce),
        blockNumber: result.blockNumber
          ? hexToNumber(result.blockNumber)
          : null,
        transactionIndex: result.transactionIndex
          ? hexToNumber(result.transactionIndex)
          : null,
      }));

  public getTransactionReceipt: IBaseProvider['getTransactionReceipt'] = txhash =>
    this.client
      .call(this.requests.getTransactionReceipt(txhash))
      .then(isValidTransactionReceipt)
      .then(({ result }) => ({
        ...result,
        transactionIndex: hexToNumber(result.transactionIndex),
        blockNumber: hexToNumber(result.blockNumber),
        cumulativeGasUsed: Wei(result.cumulativeGasUsed),
        gasUsed: Wei(result.gasUsed),
        status: result.status ? hexToNumber(result.status) : null,
        root: result.root || null,
      }));
}
