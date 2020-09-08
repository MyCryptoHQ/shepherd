import { IHexStrTransaction, TxObj } from '@src/types';
import { ICallRequest, IEstimateGasRequest, IGetBalanceRequest, IGetCodeRequest, IGetCurrentBlockRequest, IGetNetVersionRequest, IGetTransactionByHashRequest, IGetTransactionCountRequest, IGetTransactionReceiptRequest, ISendRawTxRequest } from './types';
export declare class RPCRequests {
    getNetVersion(): IGetNetVersionRequest | any;
    sendRawTx(signedTx: string): ISendRawTxRequest | any;
    estimateGas(transaction: Partial<IHexStrTransaction>): IEstimateGasRequest | any;
    getBalance(address: string): IGetBalanceRequest | any;
    ethCall(txObj: TxObj): ICallRequest | any;
    getTransactionCount(address: string): IGetTransactionCountRequest | any;
    getTransactionByHash(txhash: string): IGetTransactionByHashRequest | any;
    getTransactionReceipt(txhash: string): IGetTransactionReceiptRequest | any;
    getCurrentBlock(): IGetCurrentBlockRequest | any;
    getCode(address: string): IGetCodeRequest | any;
}
