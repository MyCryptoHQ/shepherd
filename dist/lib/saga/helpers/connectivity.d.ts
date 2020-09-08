/**
 * @description polls the offline state of a provider, then returns control to caller when it comes back online
 * @param {string} providerId
 */
export declare function checkProviderConnectivity(providerId: string): Generator<import("redux-saga/effects").RaceEffect | import("redux-saga/effects").SelectEffect, boolean, number & {
    lb: any;
}>;
