export type CurrentNetworkIdState = string;

export enum NETWORK_CURRENT_CONFIG {
  CHANGE = 'NETWORK_CONFIG_CHANGE',
}

export interface ChangeNetworkConfigAction {
  type: NETWORK_CURRENT_CONFIG.CHANGE;
  payload: { id: string };
}

export type CurrentNetworkConfigAction = ChangeNetworkConfigAction;
