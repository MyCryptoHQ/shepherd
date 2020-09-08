import { RPCProvider } from '../rpc';
import { InfuraClient } from './client';
export declare class InfuraProvider extends RPCProvider {
    client: InfuraClient;
    constructor(endpoint: string);
}
