import { IHexStrTransaction } from '@src/types';
export declare type DATA = string;
export declare type QUANTITY = string;
declare type TX = string;
export declare type DEFAULT_BLOCK = string | 'earliest' | 'latest' | 'pending';
export declare type JSONRPC2 = '2.0';
export interface IJsonRpcResponse {
    id: string;
    result: string;
    error?: {
        code: string;
        message: string;
        data?: any;
    };
}
export interface IRPCRequestBase {
    method: string;
    params?: any[];
}
export interface IGetNetVersionRequest extends IRPCRequestBase {
    method: 'net_version';
}
export interface ISendRawTxRequest extends IRPCRequestBase {
    method: 'eth_sendRawTransaction';
    params: [TX];
}
export interface IGetBalanceRequest extends IRPCRequestBase {
    method: 'eth_getBalance';
    params: [DATA, DEFAULT_BLOCK];
}
export interface IGetTokenBalanceRequest extends IRPCRequestBase {
    method: 'eth_call';
    params: [{
        to: string;
        data: string;
    }, DEFAULT_BLOCK];
}
export interface ICallRequest extends IRPCRequestBase {
    method: 'eth_call';
    params: [{
        from?: DATA;
        to: DATA;
        gas?: QUANTITY;
        gasPrice?: QUANTITY;
        value?: QUANTITY;
        data?: DATA;
    }, DEFAULT_BLOCK];
}
export interface IEstimateGasRequest extends IRPCRequestBase {
    method: 'eth_estimateGas';
    params: [Partial<IHexStrTransaction>];
}
export interface IGetTransactionCountRequest extends IRPCRequestBase {
    method: 'eth_getTransactionCount';
    params: [DATA, DEFAULT_BLOCK];
}
export interface IGetTransactionByHashRequest extends IRPCRequestBase {
    method: 'eth_getTransactionByHash';
    params: [string];
}
export interface IGetTransactionReceiptRequest extends IRPCRequestBase {
    method: 'eth_getTransactionReceipt';
    params: [string];
}
export interface IGetCurrentBlockRequest extends IRPCRequestBase {
    method: 'eth_blockNumber';
}
export declare type RPCRequest = IRPCRequestBase | IGetBalanceRequest | IGetTokenBalanceRequest | ICallRequest | IEstimateGasRequest | IGetTransactionCountRequest | IGetCurrentBlockRequest | IGetTransactionByHashRequest | IGetTransactionReceiptRequest;
export {};