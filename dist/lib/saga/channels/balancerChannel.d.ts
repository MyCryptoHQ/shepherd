import { BaseChannel } from '@src/saga/channels/base';
import { SagaIterator } from 'redux-saga';
export declare class BalancerChannel extends BaseChannel {
    name: string;
    init(): SagaIterator;
}
