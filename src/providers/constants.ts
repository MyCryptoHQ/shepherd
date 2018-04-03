import { AllProviderMethods } from '@src/types';

export const allRPCMethods: (AllProviderMethods)[] = [
  'ping',
  'getNetVersion',
  'sendCallRequest',
  'sendCallRequests',
  'getBalance',
  'estimateGas',
  'getTransactionCount',
  'getTransactionReceipt',
  'getTransactionByHash',
  'getCurrentBlock',
  'sendRawTx',

  /*web3 specific methods */
  'sendTransaction',
  'signMessage',
];
