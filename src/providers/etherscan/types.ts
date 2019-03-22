export interface IEtherscanReqBase {
  module: string;
  action?: string;
}

export interface ISendRawTxRequest extends IEtherscanReqBase {
  module: 'proxy';
  action: 'eth_sendRawTransaction';
  hex: string;
}

export interface IGetBalanceRequest extends IEtherscanReqBase {
  module: 'account';
  action: 'balance';
  address: string;
  tag: 'latest';
}

export interface ICallRequest extends IEtherscanReqBase {
  module: 'proxy';
  action: 'eth_call';
  to: string;
  data: string;
}

export interface IEstimateGasRequest extends IEtherscanReqBase {
  module: 'proxy';
  action: 'eth_estimateGas';
  to: string;
  value: string | number;
  data: string;
  from: string;
}

export interface IGetTransactionCountRequest extends IEtherscanReqBase {
  module: 'proxy';
  action: 'eth_getTransactionCount';
  address: string;
  tag: 'latest';
}

export interface IGetTransactionByHashRequest extends IEtherscanReqBase {
  module: 'proxy';
  action: 'eth_getTransactionByHash';
  txhash: string;
}

export interface IGetTransactionReceiptRequest extends IEtherscanReqBase {
  module: 'proxy';
  action: 'eth_getTransactionReceipt';
  txhash: string;
}

export interface IGetCurrentBlockRequest extends IEtherscanReqBase {
  module: 'proxy';
  action: 'eth_blockNumber';
}

export interface IGetCodeRequest extends IEtherscanReqBase {
  module: 'proxy';
  action: 'eth_getCode';
  address: string;
  tag: 'latest';
}

export type EtherscanRequest =
  | ISendRawTxRequest
  | IGetBalanceRequest
  | ICallRequest
  | IEstimateGasRequest
  | IGetTransactionCountRequest
  | IGetCurrentBlockRequest
  | IGetCodeRequest;
