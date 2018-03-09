import { IWorker } from '@src/ducks/providerBalancer/workers';
import { Channel } from 'redux-saga';
import { ProviderCall } from '@src/ducks/providerBalancer/providerCalls';

interface Workers {
  [workerId: string]: IWorker;
}

/**
 * Each channel id is a 1-1 mapping of a providerId
 */
interface IChannels {
  [key: string]: Channel<ProviderCall>;
}
