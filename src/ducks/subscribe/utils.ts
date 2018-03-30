import {
  BALANCER,
  BalancerManualFailedAction,
  BalancerManualSucceededAction,
} from '@src/ducks/providerBalancer/balancerConfig';
import { BalancerAction } from '@src/ducks/providerBalancer/balancerConfig/types';
import {
  PROVIDER_CALL,
  ProviderCallAction,
} from '@src/ducks/providerBalancer/providerCalls';
import { ProviderStatsAction } from '@src/ducks/providerBalancer/providerStats';
import { WorkerAction } from '@src/ducks/providerBalancer/workers';
import { ProviderConfigAction } from '@src/ducks/providerConfigs/types';
import { SubscribeAction, subscribeToAction } from '@src/ducks/subscribe';
import { Reject, Resolve, RootState } from '@src/types';
//import { logger } from '@src/utils/logging';
import { Dispatch } from 'redux';

type AllActions =
  | ProviderCallAction
  | WorkerAction
  | ProviderStatsAction
  | ProviderConfigAction
  | BalancerAction
  | SubscribeAction;

export const triggerOnMatchingCallId = (
  callId: number,
  includeTimeouts: boolean,
) => (action: AllActions) => {
  // check if the action is a provider failed or succeeded call
  if (
    action.type === PROVIDER_CALL.FAILED ||
    action.type === PROVIDER_CALL.SUCCEEDED ||
    action.type === PROVIDER_CALL.FLUSHED ||
    (action.type === PROVIDER_CALL.TIMEOUT && includeTimeouts)
  ) {
    // logger.log(`Callid ${callId} Triggered on ${action.type}`);
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
    action: BalancerManualFailedAction | BalancerManualSucceededAction,
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
