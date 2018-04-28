import { RPCClient } from '../rpc/client';
import { IJsonRpcResponse, RPCRequest } from '../rpc/types';
import { IWeb3Provider } from './types';

export class Web3Client extends RPCClient {
  private readonly provider: IWeb3Provider;

  constructor() {
    super('web3'); // initialized with fake endpoint
    this.provider = (window as any).web3.currentProvider;
  }

  public decorateRequest = (req: RPCRequest) => ({
    ...req,
    id: this.id(),
    jsonrpc: '2.0',
    params: req.params || [], // default to empty array so MetaMask doesn't error
  });

  public call = (request: RPCRequest): Promise<IJsonRpcResponse> =>
    this.sendAsync(this.decorateRequest(request)) as Promise<IJsonRpcResponse>;

  public batch = (requests: RPCRequest[]): Promise<IJsonRpcResponse[]> =>
    this.sendAsync(requests.map(this.decorateRequest)) as Promise<
      IJsonRpcResponse[]
    >;

  private readonly sendAsync = (
    request: any,
  ): Promise<IJsonRpcResponse | IJsonRpcResponse[]> => {
    return new Promise((resolve, reject) => {
      this.provider.sendAsync(
        request,
        (error, result: IJsonRpcResponse | IJsonRpcResponse[]) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        },
      );
    });
  };
}
