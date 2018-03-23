import { buffers, SagaIterator } from 'redux-saga';
import { PROVIDER_CALL } from '@src/ducks/providerBalancer/providerCalls';
import { actionChannel } from 'redux-saga/effects';
import { BaseChannel } from '@src/saga/channels/base';

export class BalancerChannel extends BaseChannel {
  public *init(): SagaIterator {
    this.chan = yield actionChannel(
      PROVIDER_CALL.REQUESTED,
      buffers.expanding(50),
    );
  }
}
