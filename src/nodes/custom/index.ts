import RPCNode from '../rpc';
import RPCClient from '../rpc/client';
import { MCCNodeConfig } from '@src/types/nodes';
import { Omit } from '@src/types';

export default class MyCryptoCustomNode extends RPCNode {
  constructor(config: Omit<MCCNodeConfig, 'lib'>) {
    super(config.id);

    const headers: { [key: string]: string } = {};
    if (config.auth) {
      const { username, password } = config.auth;
      headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
    }

    this.client = new RPCClient(config.id, headers);
  }
}
