import {
  IProviderCall,
  IProviderCallRequested,
} from '@src/ducks/providerBalancer/providerCalls';
import { BaseChannel } from '@src/saga/channels/base';
import { providerChannelFactory } from '@src/saga/channels/providerChannel';
import { StrIdx } from '@src/types';
import { SagaIterator } from 'redux-saga';
import { apply, call, put } from 'redux-saga/effects';

export class ProviderChannels {
  private providerChannels: StrIdx<BaseChannel>;

  constructor() {
    this.providerChannels = {};
  }

  public *put(
    providerId: string,
    action: IProviderCallRequested,
  ): SagaIterator {
    const chan = this.getChannel(providerId).get();
    yield put(chan, action);
  }

  public *createChannel(providerId: string): SagaIterator {
    if (this.providerChannels[providerId]) {
      throw Error(`${providerId} already has an existing channel open`);
    }

    const providerChannel: BaseChannel = yield call(providerChannelFactory);
    this.providerChannels[providerId] = providerChannel;
  }

  public *take(providerId: string): SagaIterator {
    const channel = this.getChannel(providerId);
    const action: IProviderCall = yield apply(channel, channel.take);
    return action;
  }

  public *cancelPendingCalls(): SagaIterator {
    const chans = Object.values(this.providerChannels);
    for (const chan of chans) {
      yield apply(chan, chan.cancelPendingCalls);
    }
  }

  public deleteAllChannels() {
    for (const providerId of Object.keys(this.providerChannels)) {
      this.deleteChannel(providerId);
    }
  }

  private deleteChannel(providerId: string) {
    //check for existence
    this.getChannel(providerId);
    Reflect.deleteProperty(this.providerChannels, providerId);
  }

  private getChannel(providerId: string) {
    const channel = this.providerChannels[providerId];
    if (!channel) {
      throw Error(`${providerId} does not have an existing channel`);
    }
    return channel;
  }
}
