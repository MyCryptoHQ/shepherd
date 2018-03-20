import { IChannels } from '@src/saga/types';
import { Channel, channel, buffers } from 'redux-saga';
import { IProviderCall } from '@src/ducks/providerBalancer/providerCalls';
import { flush, call } from 'redux-saga/effects';
import { StrIdx } from '@src/types';

class ProviderChannels {
  private channels: IChannels;
  constructor() {
    this.channels = {};
  }

  public getChannel(providerId: string) {
    const channel = this.channels[providerId];
    if (!channel) {
      throw Error(`${providerId} does not have an existing channel`);
    }
    return channel;
  }

  public *createChannel(providerId: string) {
    if (this.channels[providerId]) {
      throw Error(`${providerId} already has an existing channel open`);
    }

    const providerChannel: Channel<IProviderCall> = yield call(
      channel,
      buffers.expanding(10),
    );

    this.channels[providerId] = providerChannel;
  }

  public *flushChannels() {
    const channelEntries = Object.entries(this.channels);
    const extractedMessagesByProviderId: StrIdx<any> = {};
    for (const [providerId, chan] of channelEntries) {
      const messages = yield flush(chan);
      extractedMessagesByProviderId[providerId] = messages;
    }
    return extractedMessagesByProviderId;
  }

  public deleteChannel(providerId: string) {
    //check for existence
    this.getChannel(providerId);
    Reflect.deleteProperty(this.channels, providerId);
  }

  public deleteAllChannels() {
    for (const providerId of Object.keys(this.channels)) {
      this.deleteChannel(providerId);
    }
  }
}

export const providerChannels = new ProviderChannels();
