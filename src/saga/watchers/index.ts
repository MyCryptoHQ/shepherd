import { subscriptionWatcher } from './watchActionSubscription';
import { addProviderConfigWatcher } from './watchAddingProviders';
import { balancerFlushWatcher } from './watchBalancerFlush';
import { balancerHealthWatcher } from './watchBalancerHealth';
import { callTimeoutWatcher } from './watchCallTimeouts';
import { watchNetworkSwitches } from './watchNetworkSwitches';
import { providerRequestWatcher } from './watchProviderCalls';
import { providerHealthWatcher } from './watchProviderHealth';
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
