import { NodeConfig } from '@src/types/nodes';

export type NodeConfigState = { [key: string]: NodeConfig };

export enum NODE_CONFIG {
  ADD = 'NODE_CONFIG_ADD',
  REMOVE = 'NODE_CONFIG_REMOVE',
}

export interface AddNodeConfigAction {
  type: NODE_CONFIG.ADD;
  payload: { id: string; config: NodeConfig };
}

export interface RemoveNodeConfigAction {
  type: NODE_CONFIG.REMOVE;
  payload: { id: string };
}

export type NodeConfigAction = AddNodeConfigAction | RemoveNodeConfigAction;
