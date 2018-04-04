import {
  providerCallFlushed,
  ProviderCallRequestedAction,
} from '@src/ducks/providerBalancer/providerCalls';
import { subscribeToAction } from '@src/ducks/subscribe';
import { triggerOnMatchingCallId } from '@src/ducks/subscribe/utils';
import { Channel, SagaIterator } from 'redux-saga';
import { apply, flush, put, take } from 'redux-saga/effects';

export abstract class BaseChannel {
  protected chan: Channel<ProviderCallRequestedAction> | undefined;
  protected name: string | undefined;
  private currentAction: ProviderCallRequestedAction | null | undefined;
  private shouldLog = false;

  public get() {
    if (!this.chan) {
      throw Error(`Channel not assigned yet`);
    }

    return this.chan;
  }

  public abstract init(): void;

  public *take(): SagaIterator {
    const action: ProviderCallRequestedAction = yield take(this.get());
    // set the current action, so when we flush all of the actions we dont miss the currently processing one
    const callid = action.payload.callId;
    this.currentAction = action;
    this.log(`took call`, action.payload.callId);

    // set the current action to null when it isnt in a state of "requested"
    yield put(
      subscribeToAction({
        trigger: triggerOnMatchingCallId(
          this.currentAction.payload.callId,
          true,
        ),
        callback: () => {
          this.log(
            `call ${this.currentAction &&
              this.currentAction.payload.callId} is now null `,
          );
          this.currentAction = null;
        },
      }),
    );
    this.log(`Returning ${this.currentAction} ${callid}`);
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
    if (this.shouldLog) {
      console.log(this.name, ...args);
    }
  }

  private *flushChannel(): SagaIterator {
    const messages = yield flush(this.get());
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
