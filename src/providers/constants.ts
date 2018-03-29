import RpcProvider from '@src/providers/rpc';
export const allRPCMethods: (keyof RpcProvider)[] = [
  'ping',
  'sendCallRequest',
  'getBalance',
  'estimateGas',
  'getTransactionCount',
  'getCurrentBlock',
  'sendRawTx',
  /*
  'getTransactionCount',
  'getTransactionByHash',
  'getTransactionReceipt',

  'getTokenBalance',
  'getTokenBalances',

  getAccounts
  */
];

export const AMBIENT_PROVIDER = 'AMBIENT_PROVIDER';
