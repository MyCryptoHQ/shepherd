import { IHexStrTransaction, IRPCProvider, TransactionData, TransactionReceipt, TxObj } from '@src/types';
import { Wei } from '@src/utils';
import { RPCClient } from './client';
import { RPCRequests } from './requests';
export declare class RPCProvider implements IRPCProvider {
    protected client: RPCClient;
    protected requests: RPCRequests;
    constructor(endpoint: string);
    getNetVersion(): Promise<string>;
    ping(): Promise<boolean>;
    sendCallRequest(txObj: TxObj): Promise<string>;
    sendCallRequests(txObjs: TxObj[]): Promise<string[]>;
    getBalance(address: string): Promise<Wei>;
    estimateGas(transaction: Partial<IHexStrTransaction>): Promise<Wei>;
    getTransactionCount(address: string): Promise<string>;
    getCurrentBlock(): Promise<string>;
    sendRawTx(signedTx: string): Promise<string>;
    getTransactionByHash(txhash: string): Promise<TransactionData>;
    getTransactionReceipt(txhash: string): Promise<TransactionReceipt>;
    getCode(address: string): Promise<string>;
}
