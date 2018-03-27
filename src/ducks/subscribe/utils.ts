import { ProviderStatsAction } from '@src/ducks/providerBalancer/providerStats';
import { WorkerAction } from '@src/ducks/providerBalancer/workers';
import { ProviderConfigAction } from '@src/ducks/providerConfigs/types';
import { BalancerAction } from '@src/ducks/providerBalancer/balancerConfig/types';
import {
  ProviderCallAction,
  PROVIDER_CALL,
} from '@src/ducks/providerBalancer/providerCalls';

export const triggerOnMatchingCallId = (
  callId: number,
  includeTimeouts: boolean,
) => (
  action:
    | ProviderCallAction
    | WorkerAction
    | ProviderStatsAction
    | ProviderConfigAction
    | BalancerAction,
) => {
  // check if the action is a provider failed or succeeded call
  if (
    action.type === PROVIDER_CALL.FAILED ||
    action.type === PROVIDER_CALL.SUCCEEDED ||
    action.type === PROVIDER_CALL.FLUSHED ||
    (includeTimeouts && action.type === PROVIDER_CALL.TIMEOUT)
  ) {
    // make sure its the same call
    return action.payload.providerCall.callId === callId;
  }
};
