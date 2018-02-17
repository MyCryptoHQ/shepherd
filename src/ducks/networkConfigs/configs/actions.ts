import {
  AddNetworkConfigAction,
  NETWORK_CONFIG,
  RemoveNetworkConfigAction,
} from './types';

export const addNetworkConfig = (
  payload: AddNetworkConfigAction['payload'],
): AddNetworkConfigAction => ({ type: NETWORK_CONFIG.ADD, payload });

export const removeNetworkConfig = (
  payload: RemoveNetworkConfigAction['payload'],
): RemoveNetworkConfigAction => ({ type: NETWORK_CONFIG.REMOVE, payload });
