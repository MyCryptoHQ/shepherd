import { ProviderConfigState, providerConfigReducer } from './configs';
import { CurrentProviderIdState, currentProviderIdReducer } from './currentId';

import { combineReducers } from 'redux';

export interface ProviderConfigState {
  config: ProviderConfigState;
  currentId: CurrentProviderIdState;
}

export const providerConfigs = combineReducers({
  config: providerConfigReducer,
  currentConfig: currentProviderIdReducer,
});
