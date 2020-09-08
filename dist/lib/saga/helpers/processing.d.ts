import { IProviderConfig } from '@src/ducks/providerConfigs';
/**
 *
 * @description Handles checking if a provider is online or not,
 * and spawning workers for its concurrency rating
 * @param {string} providerId
 * @param {ProviderConfig} config
 */
export declare function processProvider(providerId: string, { concurrency }: IProviderConfig): Generator<import("redux-saga/effects").CallEffect | import("redux-saga/effects").PutEffect<import("../../ducks/providerBalancer/providerStats").IProviderStatsOffline>, {
    providerId: string;
    stats: import("../../ducks/providerBalancer/providerStats").IProviderStats;
    workers: import("../../types").StrIdx<import("../../ducks/providerBalancer/workers").IWorker>;
}, (false & {
    workers: any;
    workerIds: any;
}) | (true & {
    workers: any;
    workerIds: any;
})>;
