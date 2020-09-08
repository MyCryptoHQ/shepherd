import { RootState } from '@src/types';
export declare const getWorkers: (state: RootState) => import("./types").IWorkerState;
export declare const getWorkerById: (state: RootState, id: string) => Readonly<import("./types").IWorker>;
