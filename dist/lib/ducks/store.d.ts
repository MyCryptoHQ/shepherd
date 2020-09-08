import { Store } from 'redux';
declare class StoreManager {
    private store;
    private root;
    setRoot(r: string): void;
    getRoot(): string | undefined;
    setStore(s: Store<any>): void;
    getStore(): Store<any>;
}
export declare const storeManager: StoreManager;
export {};
