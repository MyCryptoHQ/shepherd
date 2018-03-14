import {
  CurrentProviderIdState,
  PROVIDER_CURRENT_CONFIG,
  SwitchCurrentProviderConfigAction,
} from './types';
import {
  ProviderConfigAction,
  PROVIDER_CONFIG,
  RemoveProviderConfigAction,
} from '@src/ducks/providerConfigs/configs';
import { Reducer } from 'redux';

const INITIAL_STATE: CurrentProviderIdState = null;
type PCCReducer = Reducer<CurrentProviderIdState>;

const handleProviderCurrentConfigSwitch: PCCReducer = (
  _,
  { payload }: SwitchCurrentProviderConfigAction,
) => {
  return payload.id;
};

const handleProviderConfigRemove: PCCReducer = (
  state,
  { payload }: RemoveProviderConfigAction,
) => {
  if (state === payload.id) {
    return null;
  }
  return state;
};

const currentConfigReducer = (
  state: CurrentProviderIdState = INITIAL_STATE,
  action: SwitchCurrentProviderConfigAction | ProviderConfigAction,
) => {
  switch (action.type) {
    case PROVIDER_CURRENT_CONFIG.SWITCH:
      return handleProviderCurrentConfigSwitch(state, action);
    case PROVIDER_CONFIG.REMOVE:
      return handleProviderConfigRemove(state, action);
    default:
      return state;
  }
};

export default currentConfigReducer;
