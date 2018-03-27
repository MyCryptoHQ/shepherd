import { BalancerAction } from '@src/ducks/providerBalancer/balancerConfig/types';
import {
  PROVIDER_CALL,
  ProviderCallAction,
} from '@src/ducks/providerBalancer/providerCalls';
import { ProviderStatsAction } from '@src/ducks/providerBalancer/providerStats';
import { WorkerAction } from '@src/ducks/providerBalancer/workers';
import { ProviderConfigAction } from '@src/ducks/providerConfigs/types';

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
