import {
  BALANCER,
  IBalancerManualFailed,
  IBalancerManualSucceeded,
} from '@src/ducks/providerBalancer/balancerConfig';
import { PROVIDER_CALL } from '@src/ducks/providerBalancer/providerCalls';
import { subscribeToAction } from '@src/ducks/subscribe';
import { AllActions } from '@src/ducks/types';
import { Reject, Resolve, RootState } from '@src/types';
import { Dispatch } from 'redux';

export const triggerOnMatchingCallId = (
  callId: number,
  includeTimeouts: boolean,
) => (action: AllActions) => {
  // check if the action is a provider failed or succeeded call
  if (
    action.type === PROVIDER_CALL.SUCCEEDED ||
    action.type === PROVIDER_CALL.FAILED ||
    action.type === PROVIDER_CALL.FLUSHED ||
    (includeTimeouts && action.type === PROVIDER_CALL.TIMEOUT)
  ) {
    // make sure its the same call
    return action.payload.providerCall.callId === callId;
  }
};

export function waitForNetworkSwitch(dispatch: Dispatch<RootState>) {
  return new Promise(res =>
    dispatch(
      subscribeToAction({
        trigger: BALANCER.NETWORK_SWITCH_SUCCEEDED,
        callback: res,
      }),
    ),
  );
}

export function waitForManualMode(
  dispatch: Dispatch<RootState>,
): Promise<string> {
  function triggerOnSuccessOrFail(action: AllActions) {
    return (
      action.type === BALANCER.MANUAL_SUCCEEDED ||
      action.type === BALANCER.MANUAL_FAILED
    );
  }

  const returnSuccessOrFail = (resolve: Resolve, reject: Reject) => (
    action: IBalancerManualFailed | IBalancerManualSucceeded,
  ) =>
    action.type === BALANCER.MANUAL_SUCCEEDED
      ? resolve(action.payload.providerId)
      : reject(Error(action.payload.error));

  return new Promise((resolve, reject) =>
    dispatch(
      subscribeToAction({
        trigger: triggerOnSuccessOrFail,
        callback: returnSuccessOrFail(resolve, reject),
      }),
    ),
  );
}
