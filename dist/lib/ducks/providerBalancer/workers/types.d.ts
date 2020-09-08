import { ProviderCallWithPid } from '@src/ducks/providerBalancer/providerCalls';
import { Task } from 'redux-saga';
import { IProviderCall } from '../providerCalls';
export interface IWorker {
    task: Task;
    assignedProvider: string;
    currentPayload: IProviderCall | null;
}
export interface IWorkerState {
    [workerId: string]: Readonly<IWorker>;
}
export declare enum WORKER {
    PROCESSING = "WORKER_PROCESSING",
    SPAWNED = "WORKER_SPAWNED",
    KILLED = "WORKER_KILLED"
}
export interface IWorkerSpawned {
    type: WORKER.SPAWNED;
    payload: {
        providerId: string;
        workerId: string;
        task: Task;
    };
}
export interface IWorkerProcessing {
    type: WORKER.PROCESSING;
    payload: {
        workerId: string;
        currentPayload: ProviderCallWithPid;
    };
}
export interface IWorkerKilled {
    type: WORKER.KILLED;
    payload: {
        providerId: string;
        workerId: string;
        error: Error;
    };
}
export declare type WorkerAction = IWorkerSpawned | IWorkerProcessing | IWorkerKilled;
