import { RPCProvider } from '../rpc';
import { InfuraClient } from './client';

export class InfuraProvider extends RPCProvider {
  public client: InfuraClient;

  constructor(endpoint: string) {
    super(endpoint);
    this.client = new InfuraClient(endpoint);
  }
}
