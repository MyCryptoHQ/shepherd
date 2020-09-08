import { IWorker } from '@src/ducks/providerBalancer/workers';
import { StrIdx } from '@src/types';
import { Task } from 'redux-saga';
export declare function spawnWorkers(providerId: string, currentWorkers: string[], maxNumOfWorkers: number): Generator<import("redux-saga/effects").CallEffect | import("redux-saga/effects").ForkEffect, {
    workers: StrIdx<IWorker>;
    workerIds: string[];
}, Task>;
