import { IProviderCallRequested } from '@src/ducks/providerBalancer/providerCalls';
import { Channel, SagaIterator } from 'redux-saga';
export declare abstract class BaseChannel {
    protected chan: Channel<IProviderCallRequested> | undefined;
    protected name: string | undefined;
    private currentAction;
    private readonly shouldLog;
    get(): Channel<IProviderCallRequested>;
    abstract init(): void;
    take(): SagaIterator;
    cancelPendingCalls(): SagaIterator;
    protected log(...args: any[]): void;
    private flushChannel;
    private getPendingCalls;
}
