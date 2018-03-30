import { IHexStrTransaction } from '@src/types';
import { Wei } from '@src/utils';

export type DATA = string;
export type QUANTITY = string;
type TX = string;

export type DEFAULT_BLOCK = string | 'earliest' | 'latest' | 'pending';

export type JSONRPC2 = '2.0';

export interface JsonRpcResponse {
  id: string;
  result: string;
  error?: {
    code: string;
    message: string;
    data?: any;
  };
}

export interface RPCRequestBase {
  method: string;
  params?: any[];
}

export interface SendRawTxRequest extends RPCRequestBase {
  method: 'eth_sendRawTransaction';
  params: [TX];
}

export interface GetBalanceRequest extends RPCRequestBase {
  method: 'eth_getBalance';
  params: [DATA, DEFAULT_BLOCK];
}

export interface GetTokenBalanceRequest extends RPCRequestBase {
  method: 'eth_call';
  params: [
    {
      to: string;
      data: string;
    },
    DEFAULT_BLOCK
  ];
}

export interface CallRequest extends RPCRequestBase {
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

export interface EstimateGasRequest extends RPCRequestBase {
  method: 'eth_estimateGas';
  params: [Partial<IHexStrTransaction>];
}

export interface GetTransactionCountRequest extends RPCRequestBase {
  method: 'eth_getTransactionCount';
  params: [DATA, DEFAULT_BLOCK];
}

export interface GetTransactionByHashRequest extends RPCRequestBase {
  method: 'eth_getTransactionByHash';
  params: [string];
}

export interface GetTransactionReceiptRequest extends RPCRequestBase {
  method: 'eth_getTransactionReceipt';
  params: [string];
}

export interface GetCurrentBlockRequest extends RPCRequestBase {
  method: 'eth_blockNumber';
}

export interface TransactionData {
  hash: string;
  nonce: number;
  blockHash: string | null;
  blockNumber: number | null;
  transactionIndex: number | null;
  from: string;
  to: string;
  value: Wei;
  gasPrice: Wei;
  gas: Wei;
  input: string;
}

export interface TransactionReceipt {
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  cumulativeGasUsed: Wei;
  gasUsed: Wei;
  contractAddress: string | null;
  logs: string[];
  logsBloom: string;
  status: number;
}

export type RPCRequest =
  | RPCRequestBase //base added so I can add an empty params array in decorateRequest without TS complaining
  | GetBalanceRequest
  | GetTokenBalanceRequest
  | CallRequest
  | EstimateGasRequest
  | GetTransactionCountRequest
  | GetCurrentBlockRequest
  | GetTransactionByHashRequest
  | GetTransactionReceiptRequest;
