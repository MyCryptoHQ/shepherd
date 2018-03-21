import { addProviderConfigWatcher } from './watchAddingProviders';
import { balancerFlushWatcher } from './watchBalancerFlush';
import { callTimeoutWatcher } from './watchCallTimeouts';
import { providerRequestWatcher } from './watchProviderCalls';
import { providerHealthWatcher } from './watchProviderHealth';
import { balancerHealthWatcher } from './watchBalancerHealth';
import { watchNetworkSwitches } from './watchNetworkSwitches';
import { subscriptionWatcher } from './watchActionSubscription';
export const watchers = [
  ...subscriptionWatcher,
  ...addProviderConfigWatcher,
  ...balancerFlushWatcher,
  ...callTimeoutWatcher,
  ...providerRequestWatcher,
  ...providerHealthWatcher,
  ...balancerHealthWatcher,
  ...watchNetworkSwitches,
];
