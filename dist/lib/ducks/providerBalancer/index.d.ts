import * as balancerConfigSelectors from './balancerConfig/selectors';
import * as providerCallsSelectors from './providerCalls/selectors';
import * as providerStatsSelectors from './providerStats/selectors';
import * as workersSelectors from './workers/selectors';
import { IProviderBalancerState } from './types';
export * from './types';
export declare const providerBalancer: import("redux").Reducer<IProviderBalancerState>;
export declare const providerBalancerSelectors: {
    balancerConfigSelectors: typeof balancerConfigSelectors;
    providerCallsSelectors: typeof providerCallsSelectors;
    providerStatsSelectors: typeof providerStatsSelectors;
    workersSelectors: typeof workersSelectors;
};
