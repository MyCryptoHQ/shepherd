import { IHexStrWeb3Transaction } from '@src/types';
import { RPCRequests } from '../rpc/requests';
import {
  IGetAccountsRequest,
  ISendTransactionRequest,
  ISignMessageRequest,
} from './types';

export class Web3Requests extends RPCRequests {
  public sendTransaction(
    web3Tx: IHexStrWeb3Transaction,
  ): ISendTransactionRequest {
    return {
      method: 'eth_sendTransaction',
      params: [web3Tx],
    };
  }

  public signMessage(msgHex: string, fromAddr: string): ISignMessageRequest {
    return {
      method: 'personal_sign',
      params: [msgHex, fromAddr],
    };
  }

  public getAccounts(): IGetAccountsRequest {
    return {
      method: 'eth_accounts',
    };
  }
}
