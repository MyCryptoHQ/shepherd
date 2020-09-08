import { IHexStrTransaction } from '@src/types';

export type DATA = string;
export type QUANTITY = string;
type TX = string;

export type DEFAULT_BLOCK = string | 'earliest' | 'latest' | 'pending';

export type JSONRPC2 = '2.0';

export interface IJsonRpcResponse {
  id: string;
  result: string;
  error?: {
    code: string;
    message: string;
    data?: any;
  };
}

export interface IRPCRequestBase {
  method: string;
  params?: any[];
}

export interface IGetNetVersionRequest extends IRPCRequestBase {
  method: 'net_version';
}

export interface ISendRawTxRequest extends IRPCRequestBase {
  method: 'eth_sendRawTransaction';
  params: [TX];
}

export interface IGetBalanceRequest extends IRPCRequestBase {
  method: 'eth_getBalance';
  params: [DATA, DEFAULT_BLOCK];
}

export interface IGetTokenBalanceRequest extends IRPCRequestBase {
  method: 'eth_call';
  params: [
    {
      to: string;
      data: string;
    },
    DEFAULT_BLOCK
  ];
}

export interface ICallRequest extends IRPCRequestBase {
  method: 'eth_call';
  params: [
    {
      from?: DATA;
      to: DATA;
      gas?: QUANTITY;
      gasPrice?: QUANTITY;
      value?: QUANTITY;
      data?: DATA;
    },
    DEFAULT_BLOCK
  ];
}

export interface IEstimateGasRequest extends IRPCRequestBase {
  method: 'eth_estimateGas';
  params: [Partial<IHexStrTransaction>];
}

export interface IGetTransactionCountRequest extends IRPCRequestBase {
  method: 'eth_getTransactionCount';
  params: [DATA, DEFAULT_BLOCK];
}

export interface IGetTransactionByHashRequest extends IRPCRequestBase {
  method: 'eth_getTransactionByHash';
  params: [string];
}

export interface IGetTransactionReceiptRequest extends IRPCRequestBase {
  method: 'eth_getTransactionReceipt';
  params: [string];
}

export interface IGetCurrentBlockRequest extends IRPCRequestBase {
  method: 'eth_blockNumber';
}

export type RPCRequest =
  | IRPCRequestBase //base added so I can add an empty params array in decorateRequest without TS complaining
  | IGetBalanceRequest
  | IGetTokenBalanceRequest
  | ICallRequest
  | IEstimateGasRequest
  | IGetTransactionCountRequest
  | IGetCurrentBlockRequest
  | IGetTransactionByHashRequest
  | IGetTransactionReceiptRequest;
