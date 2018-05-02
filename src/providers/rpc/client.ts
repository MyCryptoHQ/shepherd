import { BaseClient } from '@src/providers/base';
import { IStrIdx, ProviderReq } from '@src/types';
import {
  AnyJsonRpc,
  ExtractReq,
  ExtractResponse,
} from 'eth-rpc-types/primitives';

export class RPCClient extends BaseClient {
  public decorateRequest = <T extends AnyJsonRpc<boolean>>(
    req: ProviderReq<T>,
  ): ExtractReq<T> => ({
    ...(req as any),
    id: this.id(),
    jsonrpc: '2.0',
  });

  public call = <T extends AnyJsonRpc<boolean>>(
    request: ProviderReq<T>,
  ): Promise<ExtractResponse<T>> => {
    return fetch(this.endpoint, {
      method: 'POST',
      headers: this.createHeaders({
        'Content-Type': 'application/json',
        ...this.headers,
      }),
      body: JSON.stringify(this.decorateRequest(request)),
    }).then(r => r.json());
  };

  public batch = <T extends AnyJsonRpc<boolean>>(
    requests: ProviderReq<T>[],
  ): Promise<ExtractResponse<T>[]> => {
    return fetch(this.endpoint, {
      method: 'POST',
      headers: this.createHeaders({
        'Content-Type': 'application/json',
        ...this.headers,
      }),
      body: JSON.stringify(requests.map(this.decorateRequest)),
    }).then(r => r.json());
  };

  private readonly createHeaders = (headerObject: IStrIdx<string>) => {
    const headers = new Headers();
    Object.keys(headerObject).forEach(name => {
      headers.append(name, headerObject[name]);
    });
    return headers;
  };
}
