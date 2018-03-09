require('isomorphic-fetch');
import { store } from './ducks';

import { addProviderConfig as x } from './ducks/providerConfigs/configs/actions';
import { providerAdded as y } from '@src/ducks/providerBalancer/providerStats';

const addProviderConfig: typeof x = (...args: any[]) =>
  store.dispatch((x as any)(...args));

const providerAdded: typeof y = (...args: any[]) =>
  store.dispatch((y as any)(...args));

export { addProviderConfig, providerAdded, store };
