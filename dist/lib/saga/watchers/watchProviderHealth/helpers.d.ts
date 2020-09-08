import { SagaIterator } from 'redux-saga';
export declare function pollProviderUntilConnected(providerId: string): SagaIterator;
/**
 * @description waits for any action that adds to the provider stats reducer,
 * and only returns when the specified provider exists
 * @param providerId
 */
export declare function waitForProviderStatsToExist(providerId: string): Generator<import("redux-saga/effects").TakeEffect | import("redux-saga/effects").SelectEffect, boolean, Readonly<import("../../../ducks/providerBalancer/providerStats").IProviderStats> | null>;
