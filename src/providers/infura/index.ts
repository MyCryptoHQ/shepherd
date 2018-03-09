import RPCProvider from '../rpc';
import InfuraClient from './client';

export default class InfuraProvider extends RPCProvider {
  public client: InfuraClient;

  constructor(endpoint: string) {
    super(endpoint);
    this.client = new InfuraClient(endpoint);
  }
}
