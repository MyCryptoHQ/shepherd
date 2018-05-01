import { IStrIdx } from '@src/types';
import btoa from 'btoa';
import { RPCProvider } from '../rpc';
import { RPCClient } from '../rpc/client';

interface IMyCryptoCustomProviderConfig {
  url: string;
  auth?: {
    username: string;
    password: string;
  };
}

export class MyCryptoCustomProvider extends RPCProvider {
  constructor(config: IMyCryptoCustomProviderConfig) {
    super(config.url);

    const headers: IStrIdx<string> = {};
    if (config.auth) {
      const { username, password } = config.auth;
      headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
    }

    this.client = new RPCClient(config.url, headers);
  }
}
