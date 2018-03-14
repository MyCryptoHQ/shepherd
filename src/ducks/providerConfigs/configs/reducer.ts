import {
  ProviderConfigState,
  PROVIDER_CONFIG,
  ProviderConfigAction,
  AddProviderConfigAction,
  ChangeProviderConfigAction,
  RemoveProviderConfigAction,
} from './types';
import { Reducer } from 'redux';

export const INITIAL_STATE: ProviderConfigState = {};
type PCReducer = Reducer<ProviderConfigState>;

const handleProviderConfigAdd: PCReducer = (
  state,
  { payload }: AddProviderConfigAction,
) => {
  if (state[payload.id]) {
    throw Error(`Provider config ${payload.id} already exists`);
  }
  return { ...state, [payload.id]: payload.config };
};

const handleProviderConfigChange: PCReducer = (
  state,
  { payload }: ChangeProviderConfigAction,
) => {
  if (!state[payload.id]) {
    throw Error(`Provider config ${payload.id} does not exist`);
  }

  return {
    ...state,
    [payload.id]: {
      ...state[payload.id],
      ...payload.config,
    },
  };
};

const handleProviderConfigRemove: PCReducer = (
  state,
  { payload }: RemoveProviderConfigAction,
) => {
  if (!state[payload.id]) {
    throw Error(`Provider config ${payload.id} does not exist`);
  }

  const stateCopy = { ...state };
  Reflect.deleteProperty(stateCopy, payload.id);
  return stateCopy;
};

const providerConfigs = (
  state: ProviderConfigState = INITIAL_STATE,
  action: ProviderConfigAction,
) => {
  switch (action.type) {
    case PROVIDER_CONFIG.ADD:
      return handleProviderConfigAdd(state, action);
    case PROVIDER_CONFIG.CHANGE:
      return handleProviderConfigChange(state, action);
    case PROVIDER_CONFIG.REMOVE:
      return handleProviderConfigRemove(state, action);

    default:
      return state;
  }
};

export default providerConfigs;
