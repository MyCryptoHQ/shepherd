import { StrIdx } from '@src/types';
import { IJsonRpcResponse, RPCRequest } from './types';
export declare class RPCClient {
    endpoint: string;
    headers: StrIdx<string>;
    constructor(endpoint: string, headers?: StrIdx<string>);
    id(): string | number;
    decorateRequest: (req: RPCRequest) => {
        id: string | number;
        jsonrpc: string;
        method: string;
        params?: any[] | undefined;
    } | {
        id: string | number;
        jsonrpc: string;
        method: "eth_getBalance";
        params: [string, string];
    } | {
        id: string | number;
        jsonrpc: string;
        method: "eth_call";
        params: [{
            to: string;
            data: string;
        }, string];
    } | {
        id: string | number;
        jsonrpc: string;
        method: "eth_call";
        params: [{
            from?: string | undefined;
            to: string;
            gas?: string | undefined;
            gasPrice?: string | undefined;
            value?: string | undefined;
            data?: string | undefined;
        }, string];
    } | {
        id: string | number;
        jsonrpc: string;
        method: "eth_estimateGas";
        params: [Partial<import("../../types").IHexStrTransaction>];
    } | {
        id: string | number;
        jsonrpc: string;
        method: "eth_getTransactionCount";
        params: [string, string];
    } | {
        id: string | number;
        jsonrpc: string;
        method: "eth_getTransactionByHash";
        params: [string];
    } | {
        id: string | number;
        jsonrpc: string;
        method: "eth_getTransactionReceipt";
        params: [string];
    } | {
        id: string | number;
        jsonrpc: string;
        method: "eth_blockNumber";
        params?: any[] | undefined;
    } | {
        id: string | number;
        jsonrpc: string;
        method: "eth_getCode";
        params: [string, string];
    };
    call: (request: RPCRequest | any) => Promise<IJsonRpcResponse>;
    batch: (requests: RPCRequest[] | any) => Promise<IJsonRpcResponse[]>;
    private readonly createHeaders;
}
