import { IProviderCallRequested } from '@src/ducks/providerBalancer/providerCalls';
import { SagaIterator } from 'redux-saga';
export declare class ProviderChannels {
    private readonly providerChannels;
    constructor();
    put(providerId: string, action: IProviderCallRequested): SagaIterator;
    createChannel(providerId: string): SagaIterator;
    take(providerId: string): SagaIterator;
    cancelPendingCalls(): SagaIterator;
    deleteAllChannels(): void;
    private deleteChannel;
    private getChannel;
}
