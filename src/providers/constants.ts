import RpcProvider from '@src/providers/rpc';
export const allRPCMethods: (keyof RpcProvider)[] = [
  'ping',
  'sendCallRequest',
  'getBalance',
  'estimateGas',
  'getTransactionCount',
  'getCurrentBlock',
  'sendRawTx',
];
