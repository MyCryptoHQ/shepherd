import { RPCClient } from '../rpc/client';
import { IJsonRpcResponse } from '../rpc/types';
import { EtherscanRequest } from './types';
export declare class EtherscanClient extends RPCClient {
    encodeRequest(request: EtherscanRequest): string;
    call: (request: EtherscanRequest) => Promise<IJsonRpcResponse>;
    batch: (requests: EtherscanRequest[]) => Promise<IJsonRpcResponse[]>;
}
