import RPCProvider from '../rpc';
import RPCClient from '../rpc/client';
import btoa from 'btoa';
import { StrIdx } from '@src/types';

interface IMyCryptoCustomProviderConfig {
  url: string;
  auth?: {
    username: string;
    password: string;
  };
}

export default class MyCryptoCustomProvider extends RPCProvider {
  constructor(config: IMyCryptoCustomProviderConfig) {
    super(config.url);

    const headers: StrIdx<string> = {};
    if (config.auth) {
      const { username, password } = config.auth;
      headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
    }

    this.client = new RPCClient(config.url, headers);
  }
}
