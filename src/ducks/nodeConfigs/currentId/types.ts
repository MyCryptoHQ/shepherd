export type CurrentNodeIdState = string | null;

export enum NODE_CURRENT_CONFIG {
  CHANGE = 'NODE_CURRENT_CONFIG_CHANGE',
}

export interface ChangeNodeConfigAction {
  type: NODE_CURRENT_CONFIG.CHANGE;
  payload: { id: string };
}

export type CurrentNodeConfigAction = ChangeNodeConfigAction;
