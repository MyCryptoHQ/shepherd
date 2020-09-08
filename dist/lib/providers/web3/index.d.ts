import { IHexStrWeb3Transaction, IProvider } from '@src/types';
import { RPCProvider } from '../rpc';
import { Web3Client } from './client';
import { Web3Requests } from './requests';
export declare class Web3Provider extends RPCProvider {
    client: Web3Client;
    requests: Web3Requests;
    constructor();
    getNetVersion(): Promise<string>;
    sendTransaction(web3Tx: IHexStrWeb3Transaction): Promise<string>;
    signMessage(msgHex: string, fromAddr: string): Promise<string>;
    getAccounts(): Promise<string>;
}
export declare function isWeb3Provider(provider: IProvider | Web3Provider): provider is Web3Provider;
export declare const Web3Service = "MetaMask / Mist";
export declare function setupWeb3Provider(): Promise<{
    networkId: string;
    provider: Web3Provider;
}>;
export declare function isWeb3ProviderAvailable(): Promise<boolean>;
