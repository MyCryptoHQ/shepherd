import { Channel, SagaIterator } from 'redux-saga';
import {
  providerCallFlushed,
  ProviderCallRequestedAction,
} from '@src/ducks/providerBalancer/providerCalls';
import { flush, take, apply, put } from 'redux-saga/effects';

export abstract class BaseChannel {
  protected chan: Channel<ProviderCallRequestedAction>;
  private currentAction: ProviderCallRequestedAction | null;

  private *flushChannel(): SagaIterator {
    const messages = yield flush(this.chan);
    return messages;
  }

  private *getPendingCalls(): SagaIterator {
    const queuedCalls = yield apply(this, this.flushChannel);
    return this.currentAction
      ? [...queuedCalls, this.currentAction]
      : queuedCalls;
  }

  public get() {
    return this.chan;
  }

  public abstract init(): void;

  public *take(): SagaIterator {
    const action: ProviderCallRequestedAction = yield take(this.chan);
    this.currentAction = action;
    return this.currentAction;
  }

  public done() {
    this.currentAction = null;
  }

  public *cancelPendingCalls(): SagaIterator {
    const pendingCalls: ProviderCallRequestedAction[] = yield apply(
      this,
      this.getPendingCalls,
    );
    for (const { payload } of pendingCalls) {
      yield put(
        providerCallFlushed({ error: 'Call Flushed', providerCall: payload }),
      );
    }
  }
}
