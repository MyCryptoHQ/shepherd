import { store } from '@src/ducks';
import { SagaIterator } from 'redux-saga';
import { take, takeEvery } from 'redux-saga/effects';

export enum SUBSCRIBE {
  ACTION = 'SUBSCRIBE_TO_ACTION',
}

export interface SubscribeAction {
  type: SUBSCRIBE.ACTION;
  payload: {
    trigger: any;
    callback(resultingAction: any): void;
  };
}

export function subscribeToAction(
  payload: SubscribeAction['payload'],
): SubscribeAction {
  return store.dispatch({ type: SUBSCRIBE.ACTION, payload });
}

function* handleSubscribeToAction({ payload }: SubscribeAction): SagaIterator {
  const { trigger, callback } = payload;
  const resultingAction = yield take(trigger);
  callback(resultingAction);
}

export const subscriptionWatcher = [
  takeEvery(SUBSCRIBE.ACTION, handleSubscribeToAction),
];
