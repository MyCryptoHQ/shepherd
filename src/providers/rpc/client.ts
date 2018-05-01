import { IBaseRpcClient, IStrIdx, ProviderReq } from '@src/types';
import { randomBytes } from 'crypto';
import {
  AnyJsonRpc,
  ExtractReq,
  ExtractResponse,
} from 'eth-rpc-types/primitives';

export class RPCClient {
  public endpoint: string;
  public headers: IStrIdx<string>;
  constructor(endpoint: string, headers: IStrIdx<string> = {}) {
    this.endpoint = endpoint;
    this.headers = headers;
  }

  public id(): string | number {
    return randomBytes(16).toString('hex');
  }

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

  public batch = (
    requests: ProviderReq<AnyJsonRpc<boolean>>[],
  ): Promise<AnyJsonRpc<boolean>[]> => {
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
