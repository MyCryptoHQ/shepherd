export type CurrentProviderIdState = string | null;

export enum PROVIDER_CURRENT_CONFIG {
  CHANGE = 'PROVIDER_CURRENT_CONFIG_CHANGE',
}

export interface ChangeProviderConfigAction {
  type: PROVIDER_CURRENT_CONFIG.CHANGE;
  payload: { id: string };
}

export type CurrentProviderConfigAction = ChangeProviderConfigAction;
