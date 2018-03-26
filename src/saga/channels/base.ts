import {
  providerCallFlushed,
  ProviderCallRequestedAction,
} from '@src/ducks/providerBalancer/providerCalls';
import { Channel, SagaIterator } from 'redux-saga';
import { apply, flush, put, take } from 'redux-saga/effects';
import { triggerOnMatchingCallId } from '@src/providers';
import { subscribeToAction } from '@src/ducks/subscribe';

export abstract class BaseChannel {
  protected chan: Channel<ProviderCallRequestedAction>;
  protected name: string;
  private currentAction: ProviderCallRequestedAction | null;
  private shouldLog = false;

  public get() {
    return this.chan;
  }

  public abstract init(): void;

  public *take(): SagaIterator {
    const action: ProviderCallRequestedAction = yield take(this.chan);
    // set the current action, so when we flush all of the actions we dont miss the currently processing one
    this.currentAction = action;
    this.log(`took call`, action.payload.callId);

    // set the current action to null when it isnt in a state of "requested"
    yield put(
      subscribeToAction({
        trigger: triggerOnMatchingCallId(
          this.currentAction.payload.callId,
          true,
        ),
        callback: () => (this.currentAction = null),
      }),
    );
    return this.currentAction;
  }

  public *cancelPendingCalls(): SagaIterator {
    const pendingCalls: ProviderCallRequestedAction[] = yield apply(
      this,
      this.getPendingCalls,
    );
    for (const { payload } of pendingCalls) {
      yield put(
        providerCallFlushed({
          error: 'Call Flushed',
          providerCall: payload,
        }),
      );
    }
  }

  protected log(...args: any[]) {
    this.shouldLog && console.log(this.name, ...args);
  }

  private *flushChannel(): SagaIterator {
    const messages = yield flush(this.chan);
    this.log(`flushing`);
    this.log(messages);
    return messages;
  }

  private *getPendingCalls(): SagaIterator {
    const queuedCalls = yield apply(this, this.flushChannel);
    const pendingCalls = this.currentAction
      ? [...queuedCalls, this.currentAction]
      : queuedCalls;

    this.log(`get pending calls`);
    this.log(pendingCalls);

    this.currentAction = null;
    return pendingCalls;
  }
}
