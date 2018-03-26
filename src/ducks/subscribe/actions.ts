import { SUBSCRIBE, SubscribeAction } from './types';

export function subscribeToAction(
  payload: SubscribeAction['payload'],
): SubscribeAction {
  return { type: SUBSCRIBE.ACTION, payload };
}
