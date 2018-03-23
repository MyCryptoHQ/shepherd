import { apply, call } from 'redux-saga/effects';
import { BaseChannel } from '@src/saga/channels/base';
import { buffers, channel } from 'redux-saga';

class ProviderChannel extends BaseChannel {
  public *init() {
    this.chan = yield call(channel, buffers.expanding(10));
  }
}

export function* providerChannelFactory() {
  const chan = new ProviderChannel();
  yield apply(chan, chan.init);
  return chan;
}
