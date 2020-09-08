import { ProviderBalancerAction } from '@src/ducks/providerBalancer';
import { ProviderConfigAction } from '@src/ducks/providerConfigs/types';
import { SubscribeAction } from '@src/ducks/subscribe/types';
export declare type AllActions = ProviderBalancerAction | ProviderConfigAction | SubscribeAction;
