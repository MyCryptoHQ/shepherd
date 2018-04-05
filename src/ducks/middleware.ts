import { AllActions } from '@src/ducks/types';
import { Dispatch } from 'redux';

import { SUBSCRIBE } from '@src/ducks/subscribe';
// this should be the last middleware, immediately before the store
// if it's an subscription action then do not dispatch it to the store
export const filterMiddlware = () => (next: Dispatch<AllActions>) => (
  action: AllActions,
) =>
  action.type === SUBSCRIBE.ACTION ||
  action.type === SUBSCRIBE.ACTION_CANCELLABLE
    ? undefined
    : next(action);
