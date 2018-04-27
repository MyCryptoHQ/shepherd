type TWeb3ProviderCallback = (
  error: any,
  result: IJsonRpcResponse | IJsonRpcResponse[],
) => any;

type TSendAsync = (
  request: RPCRequest | any,
  callback: TWeb3ProviderCallback,
) => void;

export interface IWeb3Provider {
  sendAsync: TSendAsync;
}
