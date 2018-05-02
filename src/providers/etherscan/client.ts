import { BaseClient } from '@src/providers/base';
import {
  EtherscanRequest,
  IEtherscanRequests,
} from '@src/providers/etherscan/types';
import { AnyJsonRpc } from 'eth-rpc-types';
import URLSearchParams from 'url-search-params';

export class EtherscanClient extends BaseClient {
  public decorateRequest(request: EtherscanRequest): string {
    const encoded = new URLSearchParams();
    Object.keys(request).forEach((key: keyof IEtherscanRequests) => {
      if (request[key]) {
        encoded.set(key, request[key]);
      }
    });
    return encoded.toString();
  }

  public call = (request: EtherscanRequest): Promise<AnyJsonRpc<boolean>> =>
    fetch(this.endpoint, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      }),
      body: this.decorateRequest(request),
    }).then(r => r.json());

  public batch = (
    requests: EtherscanRequest[],
  ): Promise<AnyJsonRpc<boolean>[]> => {
    const promises = requests.map(req => this.call(req));
    return Promise.all(promises);
  };
}
