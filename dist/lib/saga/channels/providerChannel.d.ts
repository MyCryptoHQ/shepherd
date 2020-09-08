import { BaseChannel } from '@src/saga/channels/base';
declare class ProviderChannel extends BaseChannel {
    name: string;
    init(): Generator<import("redux-saga/effects").CallEffect, void, import("redux-saga").Channel<import("../../ducks/providerBalancer/providerCalls").IProviderCallRequested> | undefined>;
}
export declare function providerChannelFactory(): Generator<import("redux-saga/effects").CallEffect, ProviderChannel, unknown>;
export {};
