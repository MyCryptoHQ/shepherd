import { Reducer } from 'redux';
import {
  IAddProviderConfig,
  IChangeProviderConfig,
  IProviderConfigState,
  IRemoveProviderConfig,
  PROVIDER_CONFIG,
  ProviderConfigAction,
} from './types';

export const INITIAL_STATE: IProviderConfigState = {};

type PCReducer = Reducer<IProviderConfigState>;

const handleProviderConfigAdd: PCReducer = (
  state,
  { payload }: IAddProviderConfig,
) => {
  if (state[payload.id]) {
    throw Error(`Provider config ${payload.id} already exists`);
  }
  return { ...state, [payload.id]: payload.config };
};

const handleProviderConfigChange: PCReducer = (
  state,
  { payload }: IChangeProviderConfig,
) => {
  const { config, id } = payload;
  if (!state[id]) {
    throw Error(`Provider config ${id} does not exist`);
  }

  return {
    ...state,
    [id]: {
      ...state[id],
      ...config,
      supportedMethods: {
        ...state[id].supportedMethods,
        ...config.supportedMethods,
      },
    },
  };
};

const handleProviderConfigRemove: PCReducer = (
  state,
  { payload }: IRemoveProviderConfig,
) => {
  if (!state[payload.id]) {
    throw Error(`Provider config ${payload.id} does not exist`);
  }

  const stateCopy = { ...state };
  Reflect.deleteProperty(stateCopy, payload.id);
  return stateCopy;
};

export const providerConfigs = (
  state: IProviderConfigState = INITIAL_STATE,
  action: ProviderConfigAction,
): IProviderConfigState => {
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
