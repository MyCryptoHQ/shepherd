import { ProviderBalancerAction } from '@src/ducks/providerBalancer';
import { ProviderConfigAction } from '@src/ducks/providerConfigs/types';
import { SubscribeAction } from '@src/ducks/subscribe/types';

export type AllActions =
  | ProviderBalancerAction
  | ProviderConfigAction
  | SubscribeAction;
