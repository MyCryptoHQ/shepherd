import { IWorker } from '@src/ducks/providerBalancer/workers';
import { Channel } from 'redux-saga';
import { IProviderCall } from '@src/ducks/providerBalancer/providerCalls';

interface Workers {
  [workerId: string]: IWorker;
}
