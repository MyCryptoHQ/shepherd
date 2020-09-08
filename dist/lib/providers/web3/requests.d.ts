import { IHexStrWeb3Transaction } from '@src/types';
import { RPCRequests } from '../rpc/requests';
import { IGetAccountsRequest, ISendTransactionRequest, ISignMessageRequest } from './types';
export declare class Web3Requests extends RPCRequests {
    sendTransaction(web3Tx: IHexStrWeb3Transaction): ISendTransactionRequest;
    signMessage(msgHex: string, fromAddr: string): ISignMessageRequest;
    getAccounts(): IGetAccountsRequest;
}
