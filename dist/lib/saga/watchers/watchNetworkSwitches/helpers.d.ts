/**
 * @description Gets all of the providers of the requested next network,
 * then creates all of the workers and provider statistics required for a successful switch
 * @param network
 */
export declare function initializeNewNetworkProviders(network: string): Generator<import("redux-saga/effects").AllEffect | import("redux-saga/effects").SelectEffect, {
    providerStats: import("../../../ducks/providerBalancer/providerStats").IProviderStatsState;
    workers: import("../../../ducks/providerBalancer/workers").IWorkerState;
    network: string;
}, import("../../../types").StrIdx<import("../../../ducks/providerConfigs").IProviderConfig> & {
    providerId: string;
    stats: import("../../../ducks/providerBalancer/providerStats").IProviderStats;
    workers: import("../../../types").StrIdx<import("../../../ducks/providerBalancer/workers").IWorker>;
}[]>;
