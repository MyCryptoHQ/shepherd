import { RPCProvider } from '../rpc';
interface IMyCryptoCustomProviderConfig {
    url: string;
    auth?: {
        username: string;
        password: string;
    };
}
export declare class MyCryptoCustomProvider extends RPCProvider {
    constructor(config: IMyCryptoCustomProviderConfig);
}
export {};
