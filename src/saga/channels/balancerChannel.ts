import { PROVIDER_CALL } from '@src/ducks/providerBalancer/providerCalls';
import { BaseChannel } from '@src/saga/channels/base';
import { buffers, SagaIterator } from 'redux-saga';
import { actionChannel } from 'redux-saga/effects';

export class BalancerChannel extends BaseChannel {
  public name = 'Balancer Channel';

  public *init(): SagaIterator {
    this.chan = yield actionChannel(
      PROVIDER_CALL.REQUESTED,
      buffers.expanding(50),
    );
  }
}
