import { ISubscribe, SUBSCRIBE } from './types';

export function subscribeToAction(payload: ISubscribe['payload']): ISubscribe {
  return { type: SUBSCRIBE.ACTION, payload };
}
