import { IEtherscanRequests } from '@src/types';
import { AnyJsonRpc } from 'eth-rpc-types';
import URLSearchParams from 'url-search-params';
import { RPCClient } from '../rpc/client';

export class EtherscanClient extends RPCClient {
  public encodeRequest(request: IEtherscanRequests): string {
    const encoded = new URLSearchParams();
    Object.keys(request).forEach((key: keyof IEtherscanRequests) => {
      if (request[key]) {
        encoded.set(key, request[key]);
      }
    });
    return encoded.toString();
  }

  public call = (request: IEtherscanRequests): Promise<AnyJsonRpc<boolean>> =>
    fetch(this.endpoint, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      }),
      body: this.encodeRequest(request),
    }).then(r => r.json());

  public batch = (
    requests: IEtherscanRequests[],
  ): Promise<AnyJsonRpc<boolean>[]> => {
    const promises = requests.map(req => this.call(req));
    return Promise.all(promises);
  };
}
