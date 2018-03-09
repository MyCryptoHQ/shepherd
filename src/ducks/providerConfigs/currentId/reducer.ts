import {
  CurrentProviderIdState,
  PROVIDER_CURRENT_CONFIG,
  ChangeProviderConfigAction,
} from './types';

const INITIAL_STATE = null;

const currentConfigReducer = (
  state: CurrentProviderIdState = INITIAL_STATE,
  action: ChangeProviderConfigAction,
) => {
  switch (action.type) {
    case PROVIDER_CURRENT_CONFIG.CHANGE:
      return action.payload.id;
    default:
      return state;
  }
};

export default currentConfigReducer;
