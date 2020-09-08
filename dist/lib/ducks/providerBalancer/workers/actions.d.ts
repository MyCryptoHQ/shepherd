import { IWorkerKilled, IWorkerProcessing, IWorkerSpawned } from './types';
export declare const workerSpawned: (payload: IWorkerSpawned['payload']) => IWorkerSpawned;
export declare const workerProcessing: (payload: IWorkerProcessing['payload']) => IWorkerProcessing;
export declare const workerKilled: (payload: IWorkerKilled['payload']) => IWorkerKilled;
