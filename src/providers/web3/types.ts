import {
  DATA,
  IJsonRpcResponse,
  IRPCRequestBase,
  QUANTITY,
  RPCRequest,
} from '../rpc/types';

type MESSAGE_HEX = string;
type ADDRESS = string;

export interface ISendTransactionRequest extends IRPCRequestBase {
  method: 'eth_sendTransaction';
  params: [
    {
      from: DATA;
      to: DATA;
      gas: QUANTITY;
      gasPrice: QUANTITY;
      value: QUANTITY;
      data?: DATA;
      nonce?: QUANTITY;
    }
  ];
}

export interface ISignMessageRequest extends IRPCRequestBase {
  method: 'personal_sign';
  params: [MESSAGE_HEX, ADDRESS];
}

export interface IGetAccountsRequest extends IRPCRequestBase {
  method: 'eth_accounts';
}

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
