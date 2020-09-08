import { RPCClient } from '../rpc/client';
import { IJsonRpcResponse, RPCRequest } from '../rpc/types';
export declare class Web3Client extends RPCClient {
    private readonly provider;
    constructor();
    decorateRequest: (req: RPCRequest) => {
        id: string | number;
        jsonrpc: string;
        params: any[];
        method: string;
    } | {
        id: string | number;
        jsonrpc: string;
        params: any[];
        method: "eth_getBalance";
    } | {
        id: string | number;
        jsonrpc: string;
        params: any[];
        method: "eth_call";
    } | {
        id: string | number;
        jsonrpc: string;
        params: any[];
        method: "eth_call";
    } | {
        id: string | number;
        jsonrpc: string;
        params: any[];
        method: "eth_estimateGas";
    } | {
        id: string | number;
        jsonrpc: string;
        params: any[];
        method: "eth_getTransactionCount";
    } | {
        id: string | number;
        jsonrpc: string;
        params: any[];
        method: "eth_getTransactionByHash";
    } | {
        id: string | number;
        jsonrpc: string;
        params: any[];
        method: "eth_getTransactionReceipt";
    } | {
        id: string | number;
        jsonrpc: string;
        params: any[];
        method: "eth_blockNumber";
    } | {
        id: string | number;
        jsonrpc: string;
        params: any[];
        method: "eth_getCode";
    };
    call: (request: RPCRequest | any) => Promise<IJsonRpcResponse>;
    batch: (requests: RPCRequest[] | any) => Promise<IJsonRpcResponse[]>;
    private readonly sendAsync;
}
