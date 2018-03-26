import { SUBSCRIBE, SubscribeAction } from '@src/ducks/subscribe';
import { SagaIterator } from 'redux-saga';
import { take, takeEvery } from 'redux-saga/effects';

function* handleSubscribeToAction({ payload }: SubscribeAction): SagaIterator {
  const { trigger, callback } = payload;
  const resultingAction = yield take(trigger);
  callback(resultingAction);
}

export const subscriptionWatcher = [
  takeEvery(SUBSCRIBE.ACTION, handleSubscribeToAction),
];
