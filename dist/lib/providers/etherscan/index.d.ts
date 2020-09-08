import { RPCProvider } from '../rpc';
import { EtherscanClient } from './client';
import { EtherscanRequests } from './requests';
export declare class EtherscanProvider extends RPCProvider {
    client: EtherscanClient;
    requests: EtherscanRequests;
    constructor(endpoint: string);
}
