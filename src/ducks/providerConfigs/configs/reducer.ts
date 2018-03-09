import {
  ProviderConfigState,
  PROVIDER_CONFIG,
  ProviderConfigAction,
} from './types';

export const INITIAL_STATE: ProviderConfigState = {};

const providerConfigs = (
  state: ProviderConfigState = INITIAL_STATE,
  action: ProviderConfigAction,
) => {
  // console.log(action);
  switch (action.type) {
    case PROVIDER_CONFIG.ADD:
      return { ...state, [action.payload.id]: action.payload.config };

    case PROVIDER_CONFIG.REMOVE:
      const stateCopy = { ...state };
      Reflect.deleteProperty(stateCopy, action.payload.id);
      return stateCopy;

    default:
      return state;
  }
};

export default providerConfigs;
