export type CurrentProviderIdState = string | null;

export enum PROVIDER_CURRENT_CONFIG {
  SWITCH = 'PROVIDER_CURRENT_CONFIG_SWITCH',
}

export interface SwitchCurrentProviderConfigAction {
  type: PROVIDER_CURRENT_CONFIG.SWITCH;
  payload: { id: string };
}

export type CurrentProviderConfigAction = SwitchCurrentProviderConfigAction;
