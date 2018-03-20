import { all } from 'redux-saga/effects';
import { watchers } from '@src/saga/watchers';

export function* providerBalancer() {
  yield all(watchers);
}
