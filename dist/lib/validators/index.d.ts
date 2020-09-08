import { IJsonRpcResponse } from '@src/providers/rpc/types';
import { Schema } from 'jsonschema';
export declare const schema: {
    [key: string]: Schema;
};
export declare const isValidGetBalance: (response: IJsonRpcResponse) => any;
export declare const isValidEstimateGas: (response: IJsonRpcResponse) => any;
export declare const isValidCallRequest: (response: IJsonRpcResponse) => any;
export declare const isValidTransactionCount: (response: IJsonRpcResponse) => any;
export declare const isValidTransactionByHash: (response: IJsonRpcResponse) => any;
export declare const isValidTransactionReceipt: (response: IJsonRpcResponse) => any;
export declare const isValidCurrentBlock: (response: IJsonRpcResponse) => any;
export declare const isValidRawTxApi: (response: IJsonRpcResponse) => any;
export declare const isValidSendTransaction: (response: IJsonRpcResponse) => any;
export declare const isValidSignMessage: (response: IJsonRpcResponse) => any;
export declare const isValidGetAccounts: (response: IJsonRpcResponse) => any;
export declare const isValidGetNetVersion: (response: IJsonRpcResponse) => any;
