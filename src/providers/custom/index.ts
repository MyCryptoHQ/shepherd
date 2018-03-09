import RPCProvider from '../rpc';
import RPCClient from '../rpc/client';
import { MCCProviderConfig } from '@src/types/providers';
import { Omit } from '@src/types';
import btoa from 'btoa';

export default class MyCryptoCustomProvider extends RPCProvider {
  constructor(config: Omit<MCCProviderConfig, 'lib'>) {
    super(config.id);

    const headers: { [key: string]: string } = {};
    if (config.auth) {
      const { username, password } = config.auth;
      headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
    }

    this.client = new RPCClient(config.id, headers);
  }
}
