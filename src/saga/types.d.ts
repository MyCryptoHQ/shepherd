import { IWorker } from '@src/ducks/nodeBalancer/workers';
import { Channel } from 'redux-saga';
import { NodeCall } from '@src/ducks/nodeBalancer/nodeCalls';

interface Workers {
  [workerId: string]: IWorker;
}

/**
 * Each channel id is a 1-1 mapping of a nodeId
 */
interface IChannels {
  [key: string]: Channel<NodeCall>;
}
