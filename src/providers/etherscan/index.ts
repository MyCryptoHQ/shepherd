import RPCProvider from '../rpc';
import EtherscanClient from './client';
import EtherscanRequests from './requests';

export default class EtherscanProvider extends RPCProvider {
  public client: EtherscanClient;
  public requests: EtherscanRequests;

  constructor(endpoint: string) {
    super(endpoint);
    this.client = new EtherscanClient(endpoint);
    this.requests = new EtherscanRequests();
  }
}
