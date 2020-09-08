import { IProvider, IProviderContructor, IRPCProvider, IRPCProviderContructor, StrIdx } from '@src/types';
interface IProviderStorage {
    setClass(providerName: string, Provider: IProviderContructor | IRPCProviderContructor): void;
    getClass(providerName: string): IProviderContructor | IRPCProviderContructor;
    setInstance(providerName: string, provider: IProvider | IRPCProvider): void;
    getInstance(providerName: string): IProvider | IRPCProvider;
}
declare class ProviderStorage implements IProviderStorage {
    private readonly instances;
    private readonly classes;
    constructor(providers?: StrIdx<IProviderContructor | IRPCProviderContructor>);
    /**
     * Sets the class
     * @param providerName
     * @param Provider
     */
    setClass(providerName: string, Provider: IProviderContructor | IRPCProviderContructor): void;
    getClass(providerName: string): IProviderContructor<any> | IRPCProviderContructor<any>;
    setInstance(providerName: string, provider: IProvider | IRPCProvider): void;
    getInstance(providerName: string): IProvider | IRPCProvider;
}
export declare const providerStorage: ProviderStorage;
export {};
