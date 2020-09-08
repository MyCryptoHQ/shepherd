import { IHexStrTransaction } from '@src/types';
import { RPCRequests } from '../rpc/requests';
import { ICallRequest, IEstimateGasRequest, IGetBalanceRequest, IGetCurrentBlockRequest, IGetTransactionByHashRequest, IGetTransactionCountRequest, IGetTransactionReceiptRequest, ISendRawTxRequest } from './types';
export declare class EtherscanRequests extends RPCRequests {
    sendRawTx(signedTx: string): ISendRawTxRequest;
    estimateGas(transaction: Pick<IHexStrTransaction & {
        from: string;
    }, 'to' | 'data' | 'from' | 'value'>): IEstimateGasRequest;
    getBalance(address: string): IGetBalanceRequest;
    ethCall(transaction: Pick<IHexStrTransaction, 'to' | 'data'>): ICallRequest;
    getTransactionByHash(txhash: string): IGetTransactionByHashRequest;
    getTransactionReceipt(txhash: string): IGetTransactionReceiptRequest;
    getTransactionCount(address: string): IGetTransactionCountRequest;
    getCurrentBlock(): IGetCurrentBlockRequest;
}
